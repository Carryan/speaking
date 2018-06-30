define(['starbar'], function(starbar){
    // Vue.component('result', );
    var component = {
        props: ['nav'],
        components: {
            'starbar': starbar
        },
        template: '<div v-if="data.list" class="speaking-result">'+
                    '<p class="title">{{data.title}}</p>'+
                    '<table class="list">'+
                        '<thead>'+
                            '<tr>'+
                                '<td>原音</td> <td>录音</td> <td>重做</td> <td>得分</td> <td>答题情况</td>'+
                            '</tr>'+
                        '</thead>'+
                        '<tbody>'+
                            '<tr v-for="(v, i) in data.list" :key="i">'+
                                '<td><a href="javascript:;" class="origin-btn sp-icon"></a></td>'+
                                '<td><a href="javascript:;" class="mine-btn sp-icon"></a></td>'+
                                '<td><a href="javascript:;" class="start-btn sp-icon"></a></td>'+
                                '<td><span class="grade">{{v.grade}}</span></td>'+
                                '<td class="detail">'+
                                    '<div class="sentence">{{v.en}}</div>'+
                                    '<starbar v-if="v.star" :data="v.star"></starbar>'+
                                '</td>'+
                            '</tr>'+
                        '</tbody>'+
                    '</table>'+
                    '<div class="bottom">'+
                        '<a href="javascript:;" class="page-btn">上一课</a>'+
                        '<a href="javascript:;" class="return-btn">返回</a>'+
                        '<a href="javascript:;" class="page-btn">下一课</a>'+
                    '</div>'+
                '</div>',
        data: function () {
            return {
                data: {}
            }
        },
        created () {
            this.setData();
        },
        computed: {
            
        },
        watch: {
            '$route': 'setData'
        },
        methods: {
            setData: function() {
                var _this = this,
                    route = _this.$route,
                    ajaxData = $.extend({}, route.query, {nav: _this.nav});

                if(_this.nav==4){
                    if(ajaxData.unit) {
                        $.ajax({
                            url: "static/data/result.json",
                            type: 'GET',
                            data: JSON.stringify(ajaxData),
                            success: function(res) {
                                if(res.state=="ok") {
                                    _this.data = res.data;
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
                        _this.data = {};
                    }
                }else if(_this.nav==3){
                    $.ajax({
                        url: "static/data/result.json",
                        type: 'GET',
                        data: JSON.stringify(ajaxData),
                        success: function(res) {
                            if(res.state=="ok") {
                                _this.data = res.data;
                            }else{
                                msgError(res.msg);
                            }
                        },
                        error: function(xhr,status,error) {
                            console.log(xhr,status,error);
                            msgError(error);
                        }
                    });
                }
                
            }
        }
    }

    return component;
});