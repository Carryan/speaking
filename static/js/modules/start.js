define(['starbar'], function(starbar){
    // Vue.component('start', {});
    var component = {
        props: ['data'],
        components: {
            'starbar': starbar
        },
        template: '<div v-if="data.content" class="speaking-start">'+
                    '<div class="top">'+
                        '<p class="title">{{data.title}}</p>'+
                        '<p class="progress"><span>{{data.progress}}</span></p>'+
                    '</div>'+
                    '<div class="middle">'+
                        '<p :class="{word: isWord, sentence: !isWord}">{{data.content.en}}</p>'+
                        '<p v-if="data.content.pronounce" v-show="isPronounce" class="pronunciation">[<span>{{data.content.pronounce}}</span>]</p>'+
                        '<p v-if="data.content.cn" class="translate">{{data.content.cn}}</p>'+
                        '<a href="javascript:;" class="prev-btn sp-icon" @click="change"></a>'+
                        '<a href="javascript:;" class="next-btn sp-icon" @click="change"></a>'+
                        '<div v-if="grade" class="grade"><span>{{grade}}</span>分</div>'+
                    '</div>'+
                    '<div class="bottom">'+
                        '<a v-show="isRecording" href="javascript:;" class="submit-btn" @click="submit">提交</a>'+
                        '<div>'+
                            '<a href="javascript:;" class="origin-btn sp-icon" @click="playOrigin"></a>'+
                            '<a href="javascript:;" class="start-btn sp-icon" @click="recording"></a>'+
                            '<a href="javascript:;" class="mine-btn sp-icon"></a>'+
                        '</div>'+
                        '<div><span>原音</span><span>点击测评</span><span>我的</span></div>'+
                        '<starbar v-if="star" :data="star"></starbar>'+
                    '</div>'+
                '</div>',
        data: function () {
            return {
                isPronounce: false,
                isRecording: false,
                grade: this.data.grade || false,
                star: this.data.star || false
            }
        },
        created () {
            console.log(this.$route);
        },
        computed: {
          isWord: function() {
              return this.data.content.type==='word';
          }
        },
        watch: {
            data: function(v){
                this.grade = v.grade || false;
                this.star = v.star || false;
                this.isPronounce = false;
                this.isRecording = false;
            }
        },
        methods: {
            submit: function() {
                var _this = this;
                $.ajax({
                    url: 'static/data/score.json',
                    type: 'GET',
                    data: {},
                    success: function(res) {
                        if(res.state=="ok") {
                            _this.grade = res.data.grade;
                            if(!_this.isWord) _this.star = res.data.star;
                        }else{

                        }
                    },
                    error: function(xhr,status,error) {
                        console.log(xhr,status,error)
                    }
                });
            },
            playOrigin: function() {
                this.isPronounce = true;
                document.getElementById('originVoice').play();
            },
            recording: function() {
                this.isRecording = true;
            },
            change: function() {
                var _this = this;
                $.ajax({
                    url: 'static/data/word.json',
                    type: 'GET',
                    data: {},
                    success: function(res) {
                        if(res.state=="ok") {
                            _this.data = res.data;
                        }else{

                        }
                    },
                    error: function(xhr,status,error) {
                        console.log(xhr,status,error)
                    }
                });
            }
        }
    }

    return component;
});