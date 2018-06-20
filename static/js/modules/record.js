define(['pagination'], function(page){
    // Vue.component('record', );
    var component = {
        props: ['nav'],
        components: {
            'pagination': page
        },
        template: '<div v-if="data.list" class="speaking-record">'+
                    '<table class="record-table table-triped">'+
                        '<thead>'+
                            '<tr>'+
                                '<td>名称</td> <td>类型</td> <td>时间</td> <td>完成度</td> <td>操作</td>'+
                            '</tr>'+
                        '</thead>'+
                        '<tbody>'+
                            '<tr v-for="(v, i) in data.list">'+
                                '<td class="title">{{v.name}}</td>'+
                                '<td>{{v.type}}</td>'+
                                '<td>{{v.time}}</td>'+
                                '<td class="progress">{{v.progress}}</td>'+
                                '<td class="action">'+
                                    // '<a href="javascript:;" @click="getDetail()">查看详情</a>'+
                                    '<router-link :to="\'/record/detail\'" @click.native="getDetail()">查看详情</router-link>'+
                                '</td>'+
                            '</tr>'+
                        '</tbody>'+
                    '</table>'+
                    '<pagination v-if="data.page" '+
                        ':page-index="data.page.cur"'+
                        ':is-fisrt-last="false"'+
                        ':prev-text="\'<\'"'+
                        ':next-text="\'>\'"'+
                        ':total="data.page.total"'+
                        '@change="pageChange"'+
                    '></pagination>'+        
                '</div>',
        data: function () {
            return {
                data: {}
            }
        },
        created () {
            this.setData();
        },
        mounted: function(){
            console.log(this.$route)
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

                $.ajax({
                    url: "static/data/record.json",
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
            },
            pageChange: function(page) {
                console.log(page);
            },
            getDetail: function(){
                // this.$parent.currentComponent = "result";
                // this.$parent.$router.push({ path: '/record/detail'});
                // this.$parent.getMain('static/data/result.json');
                this.$router.push({name: "record_detail", query: {id:1}});
            }
        }
    }

    return component;
});