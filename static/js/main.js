
require.config({
	baseUrl: "static/js/",
    paths: {
        header: "modules/header",
        tree: "modules/tree",
        start: "modules/start",
        record: "modules/record",
        pagination: "modules/pagination",
        result: "modules/result",
        starbar: "modules/starbar"
    }
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
        active: 1,
        navItems: [
            {id: 1, name: "单词测评", class: "word", en: "Word Evaluation", compo: "start"},
            {id: 2, name: "句子测评", class: "sentence", en: "Sentence Evaluation", compo: "start"},
            {id: 3, name: "测评记录", class: "record", en: "Evaluation Record", compo: "record"},
            {id: 4, name: "错题本", class: "err", en: "Evaluation Record", compo: "result"}
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
    currentComponent: "",
    cData: {}
}



require(['header', 'tree', 'start'], function(){
    var speakingApp = new Vue({
        el: '#speaking_app',
        data: appData,
        beforeMount: function() {
            this.currentComponent = filterArray(this.nav.navItems, 'id', this.nav.active).compo;
        },
        computed: {
            isMenu: function() {
                return appData.nav.active!=3;
            }
        },
        methods: {
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
                $.ajax({
                    url: 'static/data/unit.json',
                    type: 'GET',
                    data: book,
                    success: function(res) {
                        if(res.state=="ok") {
                            appData.book.bookName = res.data.bookName;
                            appData.unit.menu = res.data.menu;
                            appData.book.isOpen = false;
                        }else{

                        }
                    },
                    error: function(xhr,status,error) {
                        console.log(xhr,status,error)
                    }
                });
            },
            // 选择目录节点
            selectUnit: function(id) {
                this.unit.activeId = id;
                var nav = appData.nav.active;
                var data = {
                    nav: nav,
                    book: this.getBook(),
                    node: appData.unit.activeId
                }
                var url = "#";
                if(nav==1){
                    url = 'static/data/word.json';
                }else if(nav==2) {
                    url = 'static/data/sentence.json';
                }else if(nav==3) {
                    url = 'static/data/record.json';
                }else if(nav==4) {
                    url = 'static/data/result.json';
                }
                this.getMain(url, data);
            },
            // 点击菜单
            navClick: function(id, compo) {
                if(id==this.nav.active){
                    return false;
                }else{
                    appData.nav.active=id;
                    appData.book.isOpen = true;
                    appData.unit.activeId = "";
                    appData.unit.menu = [];
                    appData.cData = {};
                    appData.currentComponent = compo;
                    if(id==3) this.getMain('static/data/record.json',{nav:3});
                }
            },
            // 获取切换内容
            getMain: function(url,data) {
                var req = [appData.currentComponent];
                require(req, function(){
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
    return r[0];
}
