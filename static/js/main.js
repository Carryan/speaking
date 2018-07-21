
// api
function getApi(name) {
    var host = "http://139.129.252.49:8080/";
    // var host = "http://192.168.0.119:821/";
    var api = {
        get_book: host+"persubmat",
        get_menu: host+"catalog",
        get_content: host+"orals",
        post_record: host+"orals/record", //上传录音
        submit_record: host+"orals/save", //保存录音结果
        history_list: host+"orals/history",
        get_audio: host+"orals/qnlink", //重新获取音频
    }
    return arguments[0] ? api[name] : api;
}

//获取main.js所在路径
var scripts = document.scripts,
	JSPATH = '';
for( var i = 0; i < scripts.length; i++ ){
	if ( /main\.js/.test(scripts[i].src) ){
		JSPATH = scripts[i].src.replace(/main\.js/, '');
		break;
	}
}

require.config({
	baseUrl: JSPATH,
    paths: {
        header: "modules/header",
        tree: "modules/tree",
        start: "modules/start",
        record: "modules/record",
        pagination: "modules/pagination",
        result: "modules/result",
        starbar: "modules/starbar",
        layer: "layer/layer",
        jquery: "jquery-2.1.1.min",
        xdomain: "jquery.xdomainrequest.min",
        recorder: "recorder/recorder",
        h5Rcorder: "recorder/h5/h5-recorder",
        flashRecorder: "recorder/flash/flash-recorder",
        swfobject: "recorder/flash/swfobject",
        wami: "recorder/flash/wami"
    },
    shim: {
        layer: {
　　　　　　deps: ['jquery'],
　　　　　　exports: "layer"
　　　　},
        xdomain: {
            deps: ['jquery']
        }
    }
});

// jq 行为
require(["jquery"], function(){
    // 省略节点加标题
    $(document).on("mouseover", ".v-tree .item", function(){
        if(this.offsetWidth<this.scrollWidth) {
            $(this).attr('title', $(this).find('.title').text());
        }else if(this.getAttribute('title')) {
            $(this).removeAttr('title');
        }
    });

});

// ajax
function sendAjax(url, data, type, callback, beforeSend, complete) {
    require(["layer", "jquery", "xdomain"], function(){
        jQuery.support.cors = true; //ie跨域问题
        $.ajax({
            url: url,
            data: data,
            type: type,
            dataType: 'json',
            beforeSend: function() {
                beforeSend && beforeSend();
            },
            complete: function() {
                complete && complete();
            },
            success: function(res) {
                if(res.state=="ok"){
                    callback(res);
                }else{
                    layer.msg(res.msg||"操作失败", {icon: 2, time: 1500});
                }
            },
            error: function(xhr,status,error) {
                console.log(xhr,status,error);
                layer.msg("服务器异常", {icon: 2, time: 1500});
            }
        });
    });
}


require(['header', 'tree'], function(header, tree){

    var Start = function(resolve) {require(['start'], resolve)},
        Record = function(resolve) {require(['record'], resolve)},
        Result = function(resolve) {require(['result'], resolve)};

    var routes = [
        { path: '/' , redirect: '/word'},
        // { path: '/'},
        { path: '/word'},
        { path: '/sentence' },
        { path: '/:nav/start', name: "start", component: Start},
        { path: '/:nav/result', name: "result", component: Result},
        { path: '/record', component: Record },
        { path: '/record/detail', name:"record_detail", component: Result },
        { path: '/err', name: "err", component: Result }
    ];

    var router = new VueRouter({
        // routes 
        routes: routes
    });

    var api = getApi();

    var speakingApp = new Vue({
        el: '#speaking_app',
        data: {
            header: {
                logo: {
                    url: "index.html",
                    icon: "static/images/logo.png"
                },
                menu: [
                    {url: "#", name: "首页"},
                    {url: "#", name: "课堂资源"},
                    {url: "#", name: "知识案例"},
                    {url: "#", name: "实验视频"},
                    {url: "#", name: "组卷中心"},
                    {url: "index.html", name: "口语测评", isActive: true}
                ]
            },
            position: [
                { url: "#", name: "首页"},
                { url: "", name: "口语测评"}
            ],
            nav: {
                active: "",
                navItems: [
                    {id: 1, name: "单词测评", class: "word", en: "Word Evaluation", type: "word", to: "/word"},
                    {id: 2, name: "句子测评", class: "sentence", en: "Sentence Evaluation", type: "sentence", to: "/sentence"},
                    {id: 3, name: "测评记录", class: "record", en: "Evaluation Record", type: "record", to: "/record"},
                    {id: 4, name: "错题本", class: "err", en: "Evaluation Record", type: "err", to: "/err"}
                ]
            },
            book:{
                isOpen: true,
                bookName: "选择教材",
                bookItems: {}
            },
            unit: {
                activeId: " ",
                menu: []
            },
            rightTitle: ""
        },
        router: router,
        components: {
            'speaking-header': header,
            'vue-tree': tree
        },
        watch: {
            '$route': function(to, from) {
                // console.log(to, from);
                var tq = to.query, fq = from.query, isSameBook = false;
                if(tq.mater==fq.mater&&tq.sub==fq.sub&&tq.fasc==fq.fasc&&tq.per==fq.per) {
                    isSameBook = true;
                }
                this.setData({isSameBook: isSameBook});
            }
        },
        created: function() {
            // console.log(this.$route);
            this.setData({isFirst: this.$route.path=="/word"});
        },
        computed: {
            isMenu: function() {
                return this.nav.active!=3;
            }
        },
        methods: {
            //  根据路由获取、设置数据
            setData: function(ops){
                var _this = this,
                    route = _this.$route,
                    query = route.query,
                    path = route.path,
                    nav_path = "/"+path.split('/')[1];

                // 导航栏激活
                _this.nav.navItems.forEach(function(v){
                    if(v.to==nav_path) _this.nav.active = v.id;
                });

                var isSameBook = ops.isSameBook||false,
                    isFirst = ops.isFirst||false;
                
                // 存在左侧菜单时
                if(_this.isMenu) { 

                    var book_params = {};
                    var isGotBook = Boolean(query.per&&query.sub&&query.fasc&&query.mater);
                    // 教材参数
                    if(isGotBook){
                        book_params = {
                            matercode: query.mater,
                            percode: query.per,
                            subcode: query.sub,
                            fasccode: query.fasc
                        }
                    }

                    // 获取教材
                    if(isSameBook&&JSON.stringify(_this.book.bookItems)!="{}") {
                        _this.book.bookName = isGotBook?_this.getBookName():"选择教材";
                        _this.book.isOpen = !isGotBook;
                    }else{
                        sendAjax(api.get_book, book_params, 'GET', function(res){
                            _this.book.bookItems = res.data;
                            _this.book.bookName = isGotBook?_this.getBookName():"选择教材";
                            _this.book.isOpen = !isGotBook;

                            // 首页
                            if(isFirst){
                                var auto_book = _this.getBook();
                                var auto_book_params = {
                                    matercode: auto_book.mater,
                                    percode: auto_book.per,
                                    subcode: auto_book.sub,
                                    fasccode: auto_book.fasc
                                }
                                sendAjax(api.get_menu, auto_book_params, 'GET', function(res){
                                    var tree = JSON.parse(JSON.stringify(res.data).replace(/childList/g,"children"));
                                    _this.unit.menu = tree;
                                    _this.activeNode();
                                });
                            }

                        });
                    }

                    // 获取目录
                    if(isGotBook) {
                        if(isSameBook&&_this.unit.menu.length){
                            query.unit&&_this.activeNode(query.unit);
                        }else{
                            sendAjax(api.get_menu, book_params, 'GET', function(res){
                                var tree = JSON.parse(JSON.stringify(res.data).replace(/childList/g,"children"));
                                _this.unit.menu = tree;
                                _this.book.isOpen = false;
                                query.unit&&_this.activeNode(query.unit);
                            });
                        }
                    }else{
                        _this.unit.menu = [];
                        _this.unit.activeId = "";
                        _this.book.bookName = "选择教材";
                        _this.book.isOpen = true;
                    }

                }


            },
            // 获取教材数据
            getBook: function() {
                var book = {};
                var bi = this.book.bookItems;
                for(var k in bi){
                    book[k] = bi[k].selected;
                }
                return book;
            },
            getBookName: function() {
                var b = this.book.bookItems;
                var per = filterArray(b.per.list, "percode", b.per.selected),
                    fasc = filterArray(b.fasc.list, "fasccode", b.fasc.selected),
                    mater = filterArray(b.mater.list, "matercode", b.mater.selected),
                    sub = filterArray(b.sub.list, "subcode", b.sub.selected);
                return per[0].pername+mater[0].matername+sub[0].subname;
            },
            // 目录加载后，激活目录节点
            activeNode: function(id) {
                var right_title = "";
                if(id) {
                    this.unit.activeId = id;
                    readTree(this.unit.menu, function(node){
                        if(node.id==id) right_title = node.name;
                    });
                    this.rightTitle = right_title;
                }else{
                    // 默认激活第一项
                    var auto_node;
                    readTree(this.unit.menu, function(node){
                        if((!node.children||!node.children.length)&&!auto_node) {
                            auto_node = node;
                        }
                    });
                    this.selectUnit(auto_node);
                }
            },
            // 改变教材选项
            menuChange: function(item) {
                var params = {}, _this = this;
                params[item+"code"] = this.book.bookItems[item].selected;
                sendAjax(api.get_book, params, 'POST', function(res){
                    _this.book.bookItems = res.data;
                });
            },
            // 选择教材，获取目录
            getMenu: function() {
                var _this = this;
                var cur_nav = filterArray(_this.nav.navItems, "id", _this.nav.active);
                if(!_this.nav.active) {
                    msgWarning('请选择菜单!');
                    return false;
                }else if(_this.nav.active==1||_this.nav.active==2){
                    _this.$router.push({name: "start", params: {nav: cur_nav[0].type}, query: _this.getBook()});
                }else if(_this.nav.active==4){
                    _this.$router.push({name: "err", query: _this.getBook()});
                }
                _this.book.isOpen = false;
            },
            // 选择目录节点
            selectUnit: function(model) {
                // 不可选设置
                if(model.children&&model.children.length) return;
                // 跳转路由
                var _this = this,
                    querys = _this.getBook(),
                    cur_nav = filterArray(_this.nav.navItems, "id", _this.nav.active);
                querys['unit'] = model.id;
                if(_this.nav.active==1||_this.nav.active==2){
                    this.$router.push({name: "start", params: {nav: cur_nav[0].type}, query: querys});
                }else if(_this.nav.active==4){
                    this.$router.push({name: "err", query: querys});
                }
            }

        }
    });
});


// common
require(["layer"], function(){
    layer.config({
    　　path: JSPATH+'/layer/'
    });
    
    // 提示框
    window.msgSuccess = function (msg) {
        layer.msg(msg||"操作成功", {icon: 1, time: 2000}); 
    }
    window.msgError = function (msg) {
        layer.msg(msg||"操作失败", {icon: 2, time: 2000}); 
    }
    window.msgWarning = function (msg) {
        layer.msg(msg||"警告", {icon: 7, time: 2000}); 
    }
    window.msgInfo = function (msg) {
        layer.msg(msg||"提示", {icon: 6, time: 2000}); 
    }

    // 询问框
    window.comfirmDialog = function(ops) {
        layer.open({
            icon: 7,
            skin: "comfirm-dialog",
            area: '398px',
            title: " ",
            content: ops.content || " ",
            resize: false,
            btn: ops.btn || ["关闭"],
            btnAlign: ops.btnAlign || 'c',
            yes: function(index, layero){
                ops.yes?ops.yes(index, layero):"";
                layer.close(index);
            },
            btn2: function(index, layero){
                ops.btn2 ? ops.btn2(index, layero) : "";
            }
        });
    }
    
    window.msgClose = function(ops) {
        layer.open({
            content: ops.content || " ",
            icon: ops.icon || 7,
            title: " ",
            area: ops.width || 'auto',
            shade: 0,
            btn: false,
            skin: "msg-close",
            resize: false,
            move: false,
            time: ops.time || 3000
        });
    }

});

// 根据某属性的值找数组对象
function filterArray(arr, key, val) {  
    var r = arr.filter(function(item){
            return item[key] == val;
        });
    return r;
}

// 遍历对象，并回调
function readTree(tree, callback) {
    for (var i = 0; i < tree.length; i++) {
        var c = callback(tree[i]);
        if(tree[i].children) {
            readTree(tree[i].children, callback);
        }
    }
}

// 将字符转换成Html
function strToHtml(str) {
    return str?str.replace(/&lt;/g,"<").replace(/&gt;/g, ">"):"";
}
