define(function(){
    Vue.component('speaking-header', {
        props: ['logo', 'menu'],
        template: '<div class="header clearfix">'+
            '<div class="logo fl" v-if="logo">'+
                '<a :href="logo.url">'+
                    '<img :src="logo.icon" alt="logo">'+
                '</a>'+
            '</div>'+
            '<ul class="menu fl">'+
                '<li v-for="(m, i) in menu" :key="i" :class="{active: m.isActive}">'+
                    '<a :href="m.url">{{m.name}}</a>'+
                '</li>'+
            '</ul>'+
            '<div class="login fr">'+
                '<a href="javascript:;" class="login-btn">登录</a>'+
            '</div>'+
        '</div>'
    });
});