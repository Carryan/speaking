define(['pagination'], function(page){
    var api = getApi();
    var component = {
        props: ['nav'],
        components: {
            'pagination': page
        },
        template: '<div v-if="list" class="speaking-record">'+
                    '<table class="record-table table-triped">'+
                        '<thead>'+
                            '<tr>'+
                                '<td>名称</td> <td>类型</td> <td>时间</td> <td>完成度</td> <td>操作</td>'+
                            '</tr>'+
                        '</thead>'+
                        '<tbody>'+
                            '<tr v-for="(v, i) in list">'+
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
                    '<pagination v-if="page" '+
                        ':page-index="page.cur"'+
                        ':is-fisrt-last="false"'+
                        ':prev-text="\'<\'"'+
                        ':next-text="\'>\'"'+
                        ':total="page.total"'+
                        '@change="pageChange"'+
                    '></pagination>'+        
                '</div>',
        data: function () {
            return {
                list: [],
                page: {}
            }
        },
        created () {
            this.setData();
        },
        watch: {
            '$route': function(to, from) {
                this.setData();
            }
        },
        methods: {
            setData: function() {
                var _this = this;
                !_this.list[0] && sendAjax(api.history_list, {p:1, s:11}, "POST", function(res){
                    res.data.list.forEach(function(v){
                        _this.list.push({
                            name: v.book_catalog_name,
                            type: v.category=="read_word"?"单词测评":"句子测评",
                            time: v.create_time,
                            progress: v.complete_number+"/"+v.total_number
                        });
                    });
                    _this.page = {
                        cur: res.data.pageNumber,
                        total: res.data.totalPage
                    }
                });
            },
            pageChange: function(page) {
                console.log(page);
            },
            getDetail: function(){
                this.$router.push({name: "record_detail", query: {id:1}});
            }
        }
    }

    return component;
});