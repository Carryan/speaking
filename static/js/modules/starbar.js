define(function(){
    // Vue.component('starbar', );
    var component = {
        props: ['data'],
        template: '<div class="star-box">'+
                    '<div class="star-item" v-if="data.accuracy!=null">'+
                        '准确度：<span class="star"><span class="star-cover" :style="starNum(data.accuracy)"></span></span>'+
                    '</div>'+
                    '<div class="star-item" v-if="data.integrity!=null">'+
                        '完整度：<span class="star"><span class="star-cover" :style="starNum(data.integrity)"></span></span>'+
                    '</div>'+
                    '<div class="star-item" v-if="data.fluency!=null">'+
                        '流利度：<span class="star"><span class="star-cover" :style="starNum(data.fluency)"></span></span>'+
                    '</div>'+
                '</div>',
        data: function () {
            return {}
        },
        methods: {
            starNum: function(num) {
                return "width: "+ (num ? num/5*100+"%" : 0)+";";
            }
        }
    }

    return component;
});