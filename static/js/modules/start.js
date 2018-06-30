define(['starbar', 'HZRecorder'], function(starbar){

    var api = getApi();
    var c_list = [], c_key;
    var originAudio = document.getElementById('originVoice'),
        recordAudio = document.getElementById('recordVoice');
    var recorder;

    var component = {
        props: ['nav', 'title'],
        components: {
            'starbar': starbar
        },
        template: '<div v-if="content.en" class="speaking-start">'+
                    '<div class="top">'+
                        '<p class="title">{{title}}</p>'+
                        '<p class="progress"><span>{{progress}}</span></p>'+
                    '</div>'+
                    '<div class="middle">'+
                        '<p :class="{word: isWord, sentence: !isWord}">{{content.en}}</p>'+
                        '<transition name="fade">'+
                            '<p class="pronunciation" v-if="isWord" v-show="isPronounce">'+
                                '[<span>{{content.pronounce}}</span>]'+
                            '</p>'+
                        '</transition>'+
                        '<p v-if="!isWord" class="translate">{{content.cn}}</p>'+
                        '<a href="javascript:;" class="prev-btn sp-icon"'+
                            ' :class="{disabled: index==0}"'+
                            ' @click="pagin(\'left\')"></a>'+
                        '<a href="javascript:;" class="next-btn sp-icon"'+
                            ' :class="{disabled: isLast}"'+
                            ' @click="pagin(\'right\')"></a>'+
                        '<div v-if="grade" class="grade"><span>{{grade}}</span>分</div>'+
                    '</div>'+
                    '<div class="bottom">'+
                        '<a href="javascript:;" class="submit-btn" @click="submit">提交</a>'+
                        '<div>'+
                            '<a href="javascript:;" class="origin-btn sp-icon" '+
                                ':class="{playing: isPronouncing}" '+
                                '@click="playOrigin"></a>'+
                            '<a href="javascript:;" class="start-btn sp-icon" '+
                                ':class="{recording: isRecording}" '+
                                '@click="recording"></a>'+
                            '<a href="javascript:;" class="mine-btn sp-icon" '+
                                ':class="{playing: isPlayRecord}"'+
                                '@click="playRecord"></a>'+
                        '</div>'+
                        '<div><span>原音</span><span>点击测评</span><span>我的</span></div>'+
                        '<starbar v-if="star" :data="star"></starbar>'+
                    '</div>'+
                '</div>',
        data: function () {
            return {
                content: {},
                index: "",
                grade: "",
                star: "",
                time_len: 10,
                isPronounce: false,
                isPronouncing: false,
                isRecording: false,
                isPlayRecord: false
            }
        },
        created () {
            this.setData();
        },
        computed: {
            isWord: function() {
                return this.nav==1;
            },
            progress: function() {
                return (this.index+1)+"/"+c_list.length;
            },
            isLast: function() {
                return this.index==c_list.length-1;
            }
        },
        watch: {
            '$route': 'setData'
        },
        methods: {
            dataInit: function() {
                this.content = {};
                this.isPronounce = false;
                this.isRecording = false;
                this.grade = "";
                this.star = "";
                this.isPronouncing = false;
                this.isPlayRecord = false;
            },
            setData: function () {  
                var _this = this,
                    route = _this.$route,
                    unit = route.query.unit;

                if(unit){ //获取单词句子列表
                    var cate = "read_word"; 
                    if(_this.nav==2) cate = "read_sentence";
                    sendAjax(api.get_content, {category: cate, bookCatalogId: unit}, 'GET', function(res){
                        c_list = res.data.list;
                        c_key = res.data.key;
                        if(c_list[0]){
                            // 选择当前进度
                            for(var i=0; i<c_list.length; i++){
                                if(!c_list[i].total_score) {
                                    _this.index = i;
                                    break;
                                }
                            }
                            _this.transData(c_list[_this.index]);
                        } else{
                            _this.dataInit();
                        }
                    });
                }else{
                    _this.dataInit();
                    c_list = [];
                }
            },
            transData: function(data){
                this.content = {
                    en: data.words,
                    cn: data.translations,
                    pronounce: data.translations
                }
                this.grade = data.totalScore?Math.floor(data.totalScore*20):"";
                this.star = {
                    accuracy: data.accuracy_score,
                    integrity: data.integrity_score,
                    fluency: data.fluency_score
                }
                // 原音
                originAudio.setAttribute("src", data.audio_url || data.audioUrl);
                // 录音
                data.recordUrl && recordAudio.setAttribute("src", data.recordUrl);
            },
            submit: function() {
                var _this = this;
                
            },
            playOrigin: function() {
                var _this = this;
                _this.isPronounce = true;
                _this.isPronouncing = true;
                originAudio.play();
                originAudio.onended = function() {
                    _this.isPronouncing = false;
                }
            },
            playRecord: function() {
                var _this = this;
                if(!c_list[_this.index].recordUrl) return false;
                _this.isPlayRecord ? recordAudio.pause() : recordAudio.play();
                _this.isPlayRecord = !_this.isPlayRecord;
                recordAudio.onended = function() {
                    _this.isPlayRecord = false;
                }
            },
            recording: function() {
                var _this = this;
                if(_this.isRecording) {
                    // 停止录音
                    _this.isRecording = false;
                    recorder.stop();
                    blobToDataURL(recorder.getBlob(), function(blob){
                        var record = JSON.parse(JSON.stringify(c_list[_this.index]));
                        record.category = "read_sentence";
                        record.key = c_key;
                        record.pcm = encodeURIComponent( blob.replace('data:audio/pcm;base64,', '').replace(/^\s+|\s+$/gm,''));
                        // 提交录音
                        sendAjax(api.post_record, {data: JSON.stringify(record) }, 'POST', function(res){
                            console.log(res);
                            _this.transData(res.data);
                        });
                    });
                }else{
                    // 开始录音
                    _this.isRecording = true;
                    HZRecorder.get(function (rec) {
                        recorder = rec;
                        recorder.start();
                    });
                    // 限制录音时间
                    setTimeout(function(){
                        if(_this.isRecording) {
                            recorder.stop();
                            _this.isRecording = false;
                        }
                    }, _this.time_len*1000);
                }

            },
            pagin: function(d) {
                if(this.isRecording) return;
                if(d=="left" && this.index-1>=0){
                    this.index=this.index-1;
                }else if(d=="right" && this.index+1<c_list.length) {
                    this.index=this.index+1;
                }
                this.transData(c_list[this.index]);
            }
        }
    }

    // blob转base64
    function blobToDataURL(blob, callback) {
        var a = new FileReader();
        a.onload = function (e) { callback(e.target.result); }
        a.readAsDataURL(blob);
    }

    return component;
});