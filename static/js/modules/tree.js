define(function(){
    var component = {
        name: 'tree-item',
        props: ['model', 'activeid'],
        template: '<li :class="{hasFolder: isFolder}">'+
                    '<div class="item" :class="{active: isActive}" @click="nodeClick(model)">'+
                        '<span v-if="isFolder" @click.stop="toggle" class="folder-icon">{{ open? "-" : "+" }}</span>'+
                        '<span v-if="isFolder" class="title" @click.stop="toggle">{{ model.name }}</span>'+
                        '<span v-else class="title">{{ model.name }}</span>'+
                    '</div>'+
                    '<ul v-show="open" v-if="isFolder" class="children">'+
                        '<tree-item v-for="(m, i) in model.children" :key="i" :model="m" :activeid="activeid" @node-click="outClick"></tree-item>'+
                    '</ul>'+
                '</li>',
        data: function () {
            return {
                open: false
            }
        },
        created: function(){
            this.openActive();
        },
        updated: function(){
            this.openActive();
        },
        computed: {
            isFolder: function () {
                return this.model.children && this.model.children.length;
            },
            isActive: function () {
                return this.model.id==this.activeid;
            }
        },
        methods: {
            openActive: function() {
                // 层层打开激活项
                if(this.model.id==this.activeid) {
                    var p =  this.$parent;
                    parentOpen(p);
                }
                function parentOpen(p) {
                    if(p.model){
                        p.open = true;
                        return parentOpen(p.$parent);
                    }else{
                        return ;
                    }
                }
            },
            toggle: function () {
                if (this.isFolder) {
                    this.open = !this.open;
                }
            },
            nodeClick: function(model){
                this.$emit('node-click', model);
            },
            outClick: function(model){
                this.$emit('node-click', model);
            }
        }
    }

    return component;
});
