
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
        jquery: "jquery-2.1.1.min"
    },
    shim: {
        layer: {
　　　　　　deps: ['jquery'],
　　　　　　exports: "layer"
　　　　}
    }
});

// jq 行为
require(["jquery"], function(){
    // 省略节点加标题
    $(document).on("mouseover", ".v-tree .item", function(){
        if(this.offsetWidth<this.scrollWidth && !this.getAttribute('title')) {
            this.setAttribute('title', this.textContent);
        }
    });
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
                    {name: "初一", value: "1"},
                    {name: "初二", value: "2"},
                    {name: "初三", value: "3"}
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
        { path: '/' },
        { path: '/word'},
        { path: '/:nav/start', name: "start", component: Start},
        { path: '/sentence', component: Start },
        { path: '/record', component: Record },
        { path: '/record/detail', name:"record_detail", component: Result },
        { path: '/err', name: "err", component: Result }
    ];

    var router = new VueRouter({
        routes 
    });

    // router.beforeEach((to, from, next) => {
    //     console.log(to,from,next);
    // })

    var speakingApp = new Vue({
        el: '#speaking_app',
        data: appData,
        router,
        components: {
            'speaking-header': header,
            'vue-tree': tree
        },
        watch: {
            '$route' (to, from) {
                // console.log(to, from);
                this.setData();
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
                return appData.nav.active!=3;
            }
        },
        methods: {
            //  根据路由设置数据
            setData: function(){
                var _this = this,
                    route = _this.$route,
                    query = route.query,
                    path = route.path,
                    nav_path = "/"+path.split('/')[1];
                // 导航栏激活
                appData.nav.navItems.forEach(function(v){
                    if(v.to==nav_path) appData.nav.active = v.id;
                });
                // 左侧目录
                if(query){
                    appData.book.bookItems.forEach(function(v){
                        v.value = query[v.name];
                    });
                    // 选择教材
                    if(query.period&&query.subject&&query.version&&query.grade) {
                        var data = {
                            book: _this.getBook(),
                            nav: _this.nav.active
                        };
                        $.ajax({
                            url: 'static/data/unit.json',
                            type: 'GET',
                            data: data,
                            success: function(res) {
                                if(res.state=="ok") {
                                    appData.book.bookName = res.data.bookName;
                                    appData.unit.menu = res.data.menu;
                                    appData.book.isOpen = false;
                                    // 选择目录
                                    if(query.unit){
                                        _this.unit.activeId = query.unit;
                                    }else{
                                        _this.unit.activeId = 0;
                                    }
                                }else{
                                    msgError(res.msg);
                                }
                            },
                            error: function(xhr,status,error) {
                                console.log(xhr,status,error);
                                msgError(error);
                            }
                        });
                    }else{
                        _this.book.isOpen = true;
                        _this.unit.menu = [];
                    }
                    
                }
            },
            // 获取教材数据
            getBook: function() {
                var book = {};
                appData.book.bookItems.forEach(function(v){
                    book[v.name] = v.value;
                });
                return book;
            },
            // 选择教材，获取目录
            getMenu: function() {
                var book = this.getBook();
                var _this = this;
                var cur_path = _this.$route.path;

                var cur_nav = filterArray(_this.nav.navItems, "id", _this.nav.active),
                    nav_type = cur_nav[0].type;

                if(!_this.nav.active) {
                    msgWarning('请选择菜单!');
                    return false;
                }else if(_this.nav.active==1||_this.nav.active==2){
                    _this.$router.push({name: "start", params: {nav: nav_type}, query: _this.getBook()});
                }else if(_this.nav.active==4){
                    _this.$router.push({name: "err", query: _this.getBook()});
                }
                
            
                // 获取目录
                // $.ajax({
                //     url: 'static/data/unit.json',
                //     type: 'GET',
                //     data: book,
                //     success: function(res) {
                //         if(res.state=="ok") {
                //             appData.book.bookName = res.data.bookName;
                //             appData.unit.menu = res.data.menu;
                //             appData.book.isOpen = false;
                //         }else{

                //         }
                //     },
                //     error: function(xhr,status,error) {
                //         console.log(xhr,status,error)
                //     }
                // });
            },
            // 选择目录节点
            selectUnit: function(id) {
                this.unit.activeId = id;

                var _this = this,
                    querys = this.getBook(),
                    cur_nav = filterArray(this.nav.navItems, "id", this.nav.active),
                    nav_type = cur_nav[0].type;
                
                querys['unit'] = id;
                if(_this.nav.active==1||_this.nav.active==2){
                    this.$router.push({name: "start", params: {nav: nav_type}, query: querys})
                }else if(_this.nav.active==4){
                    this.$router.push({name: "err", query: querys});
                }
                

                // var nav = appData.nav.active;
                // var data = {
                //     nav: nav,
                //     book: this.getBook(),
                //     node: appData.unit.activeId
                // }
                // var url = "#";
                // if(nav==1){
                //     url = 'static/data/word.json';
                // }else if(nav==2) {
                //     url = 'static/data/sentence.json';
                // }else if(nav==3) {
                //     url = 'static/data/record.json';
                // }else if(nav==4) {
                //     url = 'static/data/result.json';
                // }
                // this.getMain(url, data);
            },
            // 点击菜单
            navClick: function(id) {
                // console.log(this.$route)
                if(id==this.nav.active){
                    return false;
                }else{
                    appData.nav.active=id;
                    appData.book.isOpen = true;
                    appData.unit.activeId = "";
                    appData.unit.menu = [];
                    appData.cData = {};
                    // appData.currentComponent = compo;
                    if(id==3) this.getMain('static/data/record.json',{nav:3});
                }
            },
            // 获取切换内容
            getMain: function(url,data) {
                $.ajax({
                    url: url,
                    type: 'GET',
                    data: JSON.stringify(data),
                    success: function(res) {
                        if(res.state=="ok") {
                            appData.cData = res.data;
                        }else{

                        }
                    },
                    error: function(xhr,status,error) {
                        console.log(xhr,status,error)
                    }
                });
            }
        }
    });
});


// 根据某属性的值找数组对象
function filterArray(arr, key, val) {  
    var r = arr.filter(function(item){
            return item[key] === val;
        });
    return r;
}

// common
require(["layer"], function(){
    layer.config({
    　　path: JSPATH+'/layer/'
    });
    common();
});

function common() {

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
}