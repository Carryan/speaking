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
                                '<td class="title">{{v.book_catalog_name}}</td>'+
                                '<td>{{v.category=="read_word"?"单词测评":"句子测评"}}</td>'+
                                '<td>{{v.create_time}}</td>'+
                                '<td class="progress">{{v.complete_number+"/"+v.total_number}}</td>'+
                                '<td class="action">'+
                                    '<a href="javascript:;" '+
                                        '@click="getDetail(v.category, v.book_catalog_id, v.book_catalog_name)">查看详情'+
                                    '</a>'+
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
                page: {},
                page_size: 11
            }
        },
        created: function() {
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
                !_this.list[0] && sendAjax(api.history_list, {p:1, s:_this.page_size}, "POST", function(res){
                    _this.list = res.data.list;
                    _this.page = {
                        cur: res.data.pageNumber,
                        total: res.data.totalPage
                    }
                });
            },
            pageChange: function(page) {
                var _this = this;
                sendAjax(api.history_list, {p: page, s: _this.page_size}, "POST", function(res){
                    _this.list = res.data.list;
                    _this.page = {
                        cur: res.data.pageNumber,
                        total: res.data.totalPage
                    }
                });
            },
            getDetail: function(cate, id, t){
                this.$parent.rightTitle = t;
                this.$router.push({name: "record_detail", query: {category: cate, bookCatalogId: id}});
            }
        }
    }

    return component;
});