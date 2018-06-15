define(function(){
    // Vue.component('pagination', );
    var component = {
        template: '<ul class="paging">'+
            '<li class="paging-item--prev" '+
                ':class="{\'paging-item--disabled\': index === 1}" '+
                '@click="prev">{{ prevText }}</li>'+
            '<li v-if="isFisrtLast" class="paging-item--first" '+
                ':class="{\'paging-item--disabled\': index === 1}" '+
                '@click="first">{{ firstText }}</li>'+
            '<li class="paging-item--more" v-if="showPrevMore">...</li>'+
            '<li v-for="pager in pagers" '+
                ':class="{\'paging-item--current\': index === pager}"'+
                '@click="go(pager)">{{ pager }}</li>'+
            '<li class="paging-item--more" v-if="showNextMore">...</li>'+
            '<li v-if="isFisrtLast" class="paging-item--last" '+
                ':class="{\'paging-item--disabled\': index === pages}" '+
                '@click="last">{{ lastText }}</li>'+
            '<li class="paging-item--next" '+
                ':class="{\'paging-item--disabled\': index === pages}"'+
                '@click="next">{{ nextText }}</li>'+
        '</ul>',
        props: {
            perPages: { //页面中的可见页码，其他的以...替代, 必须是奇数
                type: Number,
                default: 5 
            },
            pageIndex: { //当前页码
                type: Number,
                default: 1
            },
            // pageSize: { //每页显示条数
            //     type: Number,
            //     default: 10
            // },
            total: { //总记录数
                type: Number,
                default: 1
            },
            isFisrtLast: {
                type: Boolean,
                default: true
            },
            firstText: {
                type: String,
                default: "首页"
            },
            lastText: {
                type: String,
                default: "尾页"
            },
            prevText: {
                type: String,
                default: "上一页"
            },
            nextText: {
                type: String,
                default: "下一页"
            }
        },
        data: function () {
            return {
                index : this.pageIndex, //当前页码
                // limit : this.pageSize, //每页显示条数
                size : this.total || 1, //总记录数
                showPrevMore : false,
                showNextMore : false
            }
        },
        computed: {
            pages(){ //计算总页码
                // return Math.ceil(this.size / this.limit)
                return this.size;
            },
            //计算页码，当count等变化时自动计算
            pagers () {
                const array = [];
                const perPages = this.perPages;
                const pageCount = this.pages;
                let current = this.index;
                const _offset = (perPages - 1) / 2;
                const offset = {
                    start : current - _offset,
                    end   : current + _offset
                }
                //-1, 3
                if (offset.start < 1) {
                    offset.end = offset.end + (1 - offset.start)
                    offset.start = 1
                }
                if (offset.end > pageCount) {
                    offset.start = offset.start - (offset.end - pageCount)
                    offset.end = pageCount
                }
                if (offset.start < 1) offset.start = 1

                this.showPrevMore = (offset.start > 1)
                this.showNextMore = (offset.end < pageCount)

                for (let i = offset.start; i <= offset.end; i++) {
                    array.push(i)
                }

                return array;
            }
        },
        methods: {
            prev: function(){
                if (this.index > 1) {
                    this.go(this.index - 1)
                }
            },
            next: function(){
                if (this.index < this.pages) {
                    this.go(this.index + 1)
                }
            },
            first: function(){
                if (this.index !== 1) {
                    this.go(1)
                }
            },
            last: function(){
                if (this.index != this.pages) {
                    this.go(this.pages)
                }
            },
            go: function(page) {
                if (this.index !== page) {
                    this.index = page
                    //父组件通过change方法来接受当前的页码
                    this.$emit('change', this.index)
                }
            }
        },
        watch : {
            pageIndex(val) {
                this.index = val || 1
            },
            // pageSize(val) {
            //     this.limit = val || 10
            // },
            total(val) {
                this.size = val || 1
            }
        }
    }

    return component;
});