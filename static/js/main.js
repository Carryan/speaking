
// api
function getApi(name) {
    var host = "http://139.129.252.49:8080/orals/";
    var api = {
        host: "http://139.129.252.49:8080",
        get_book: host+"persubmat",
        get_menu: host+"catalog",
        get_content: host+"orals",
        post_record: host+"orals/record"
    }
    return arguments[0] ? api[name] : api;
}

// ajax
function sendAjax(url, data, type, callback, beforeComplete) {
    require(["layer", "jquery"], function(){
        if(arguments[4]){
            console.log("ajax 完成前");
            $(document).ajaxStart(function(){
                beforeComplete();
            });
        }
        $.ajax({
            url: url,
            data: data,
            type: type,
            success: function(res) {
                if(res.state=="ok"){
                    callback(res);
                }else{
                    layer.msg(res.msg||"请求失败", {icon: 2, time: 1500});
                }
            },
            error: function(xhr,status,error) {
                layer.msg("网络错误："+error, {icon: 2, time: 1500});
            }
        });
    });
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
        mediaRecorder: "MediaStreamRecorder.min",
        HZRecorder: "HZRecorder"
    },
    shim: {
        layer: {
　　　　　　deps: ['jquery'],
　　　　　　exports: "layer"
　　　　}
    }
});

// Mock.mock('1.json','get',{
//    'sid|+1': 1,
// });

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

    // $.ajax({
    //     url: "1.json",
    //     type: "GET",
    //     success: function (res) {  
    //         console.log(res);
    //     }
    // })
});


var appData = {
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
    book: {
        isOpen: true,
        bookName: "选择教材",
        bookItems: [
            {
                type: "radio",
                name: "period",
                title: "学段",
                value: "1",
                items: [
                    {name: "小学", value: "1"},
                    {name: "初中", value: "2"},
                    {name: "高中", value: "3"}
                ]
            },
            {
                type: "radio",
                name: "subject",
                title: "科目",
                value: "1",
                items: [{name: "英语", value: "1"}]
            },
            {
                type: "select",
                name: "version",
                title: "教版",
                value: "1",
                items: [
                    {name: "人教版", value: "1"},
                    {name: "新课标", value: "2"}
                ]
            },
            {
                type: "select",
                name: "grade",
                title: "年级",
                value: "1",
                items: [
                    {name: "一年级", value: "1"},
                    {name: "二年级", value: "2"},
                    {name: "三年级", value: "3"},
                    {name: "四年级", value: "4"},
                    {name: "五年级", value: "5"},
                    {name: "六年级", value: "6"}
                ]
            }
        ]
    },
    unit: {
        activeId: " ",
        menu: []
    },
    // currentComponent: "",
    cData: {}
}

require(['header', 'tree'], function(header, tree){

    var Start = resolve => require(['start'], resolve), //必须是AMD风格的模块
        Record  = resolve => require(['record'], resolve),
        Result = resolve => require(['result'], resolve);

    var routes = [
        { path: '/' , redirect: '/word'},
        { path: '/word'},
        { path: '/:nav/start', name: "start", component: Start},
        { path: '/sentence' },
        { path: '/record', component: Record },
        { path: '/record/detail', name:"record_detail", component: Result },
        { path: '/err', name: "err", component: Result }
    ];

    var router = new VueRouter({
        routes 
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
        router,
        components: {
            'speaking-header': header,
            'vue-tree': tree
        },
        watch: {
            '$route' (to, from) {
                // console.log(to, from)
                var tq = to.query, fq = from.query, isSameBook = false;
                if(tq.mater==fq.mater&&tq.sub==fq.sub&&tq.fasc==fq.fasc&&tq.per==fq.per) {
                    isSameBook = true;
                }
                this.setData(isSameBook);
            }
        },
        created: function() {
            this.setData();
        },
        beforeMount: function() {
            // this.currentComponent = filterArray(this.nav.navItems, 'id', this.nav.active)[0].compo;
        },
        mounted: function() {
            // console.log(this.$route);
        },
        beforeRouteUpdate (to, from, next) {
            // console.log(this.$route);
        },
        computed: {
            isMenu: function() {
                return this.nav.active!=3;
            }
        },
        methods: {
            //  根据路由设置数据
            setData: function(isSameBook){
                var _this = this,
                    route = _this.$route,
                    query = route.query,
                    path = route.path,
                    nav_path = "/"+path.split('/')[1];

                // 导航栏激活
                _this.nav.navItems.forEach(function(v){
                    if(v.to==nav_path) _this.nav.active = v.id;
                });
                
                // 左侧目录
                if(query.per&&query.sub&&query.fasc&&query.mater){
                    var book_params = {
                        matercode: query.mater,
                        percode: query.per,
                        subcode: query.sub,
                        fasccode: query.fasc
                    }
                    // 如果刷新，则重加载教材
                    if(JSON.stringify(_this.book.bookItems) == "{}") {
                        sendAjax(api.get_book, book_params, 'GET', function(res){
                            _this.book.bookItems = res.data;
                        });
                    }
                    // 获取目录
                    !isSameBook && sendAjax(api.get_menu, book_params, 'GET', function(res){
                        var tree = JSON.parse(JSON.stringify(res.data).replace(/childList/g,"children"));
                        _this.unit.menu = tree;
                        if(query.unit) {
                            _this.unit.activeId = query.unit;
                            // 获取标题
                            readTree(_this.unit.menu, function(node){
                                var c = node.children;
                                if(c.length){
                                    var n = filterArray(c, "id", query.unit);
                                    if(n[0]) {
                                        _this.rightTitle = node.name;
                                        return false;
                                    }
                                }
                            });
                        }else{
                            _this.unit.activeId = " ";
                        }
                    });

                }else{
                    // 获取教材
                    sendAjax(api.get_book, {}, 'GET', function(res){
                        _this.book.bookItems = res.data;
                        _this.book.isOpen = true;
                        _this.unit.menu = [];
                    });
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
            selectUnit: function(id) {
                this.unit.activeId = id;
                
                var _this = this,
                    querys = this.getBook(),
                    cur_nav = filterArray(this.nav.navItems, "id", this.nav.active);
                
                querys['unit'] = id;
                if(_this.nav.active==1||_this.nav.active==2){
                    this.$router.push({name: "start", params: {nav: cur_nav[0].type}, query: querys});
                }else if(_this.nav.active==4){
                    this.$router.push({name: "err", query: querys});
                }
                
            },
            // 点击菜单
            navClick: function(id) {
                this.nav.active=id;
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
        callback(tree[i]);
        if(tree[i].children) {
            readTree(tree[i].children, callback);
        }
    }
}