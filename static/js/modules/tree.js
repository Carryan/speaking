define(function(){
    Vue.component('vue-tree', {
        name: 'tree-item',
        props: ['model', 'activeid'],
        template: '<li :class="{hasFolder: isFolder}">'+
                    '<div class="item" :class="{active: isActive}" @click="nodeClick(model.id)">'+
                        '<span v-if="isFolder" @click.stop="toggle" class="folder-icon">{{ open? "-" : "+" }}</span>'+
                        '{{ model.name }}'+
                    '</div>'+
                    '<ul v-show="open" v-if="isFolder" class="children">'+
                        '<tree-item v-for="(m, i) in model.children" :key="i" :model="m" :activeid="activeid" @node-click="outClick"></tree-item>'+
                    '</ul>'+
                '</li>',
        data: function () {
            return {
                open: true
            }
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
            toggle: function () {
                if (this.isFolder) {
                    this.open = !this.open
                }
            },
            nodeClick: function(id){
                this.$emit('node-click', id);
            },
            outClick: function(id){
                this.$emit('node-click', id);
            }
        }
    });
});