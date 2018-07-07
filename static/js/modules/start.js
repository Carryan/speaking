define(['starbar', 'HZRecorder'], function(starbar){

    var api = getApi();
    var c_key;
    var originAudio = document.getElementById('originVoice'),
        recordAudio = document.getElementById('recordVoice');
    var recorder;

    var component = {
        props: ['nav', 'rtitle'],
        components: {
            'starbar': starbar
        },
        template: '<div class="speaking-start">'+
                    '<div class="top">'+
                        '<p class="title">{{rtitle}}</p>'+
                        '<p class="progress" v-show="list.length"><span>{{progress}}</span></p>'+
                    '</div>'+
                    '<div class="middle" v-show="content.en">'+
                        '<p :class="{word: isWord, sentence: !isWord}">{{content.en}}</p>'+
                        '<p class="pronunciation" v-if="isWord" v-show="grade">'+
                            '[<span>{{content.pronounce}}</span>]'+
                        '</p>'+
                        '<p v-if="!isWord" class="translate">{{content.cn}}</p>'+
                        '<a href="javascript:;" class="prev-btn sp-icon"'+
                            ' :class="{disabled: index==0}"'+
                            ' @click="pagin(\'left\')"></a>'+
                        '<a href="javascript:;" class="next-btn sp-icon"'+
                            ' :class="{disabled: isLast}"'+
                            ' @click="pagin(\'right\')"></a>'+
                        '<div v-if="grade" class="grade"><span>{{grade}}</span>分</div>'+
                    '</div>'+
                    '<div class="bottom" v-show="content.en">'+
                        '<a v-if="isLast" href="javascript:;" class="submit-btn" @click="submit">提交</a>'+
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
                        '<starbar v-if="!isWord&&star" :data="star"></starbar>'+
                    '</div>'+
                    '<div class="loading loading-active" v-show="state==1"></div>'+
                    '<div class="empty-tip" v-if="!content.en&&state==2">暂无内容</div>'+
                '</div>',
        data: function () {
            return {
                list: [],
                index: "",
                content: {},
                grade: "",
                star: "",
                time_len: 10,
                isPronouncing: false,
                isRecording: false,
                isPlayRecord: false,
                state: 0 // 0-unload, 1-loading, 2-loaded, 3-start
            }
        },
        created: function() {
            this.setData();
        },
        computed: {
            isWord: function() {
                return this.nav==1;
            },
            progress: function() {
                return (this.index+1)+"/"+this.list.length;
            },
            isLast: function() {
                return this.index==this.list.length-1;
            }
        },
        watch: {
            '$route': 'setData'
        },
        beforeRouteLeave: function(to, from, next) {
            if(this.state==3) {
                comfirmDialog({
                    content: "您还没有提交，离开将不保存成绩！",
                    btn: ["我再想想", "坚持离开"],
                    yes: function(index, layero) {
                        next(false);
                        layer.close(index);
                    },
                    btn2: function(index, layero) {
                        next();
                        layer.close(index);
                    }
                });
            }else{
                next();
            }
        },
        methods: {
            dataInit: function() {
                this.list = [];
                this.content = {};
                this.isRecording = false;
                this.grade = "";
                this.star = "";
                this.isPronouncing = false;
                this.isPlayRecord = false;
                this.state = 0;
            },
            setData: function () {  
                var _this = this,
                    route = _this.$route,
                    unit = route.query.unit;
                if(unit){ 
                    var cate = "read_word";
                    if(_this.nav==2) cate = "read_sentence";
                    //获取单词句子列表
                    sendAjax(api.get_content, {category: cate, bookCatalogId: unit}, 'GET', function(res){
                        _this.list = res.data.list;
                        c_key = res.data.key;
                        if(_this.list[0]){
                            // 选择当前进度
                            for(var i=0; i<_this.list.length; i++){
                                if(!_this.list[i].total_score) {
                                    _this.index = i;
                                    break;
                                }
                            }
                            _this.transData(_this.list[_this.index]);
                        } else{
                            _this.dataInit();
                        }
                    }, function(){
                        _this.state = 1;
                    }, function(){
                         _this.state = 2;
                    });
                }else{
                    _this.dataInit();
                }
            },
            transData: function(data){
                this.content = {
                    en: data.words,
                    cn: data.translations,
                    pronounce: data.translations
                }
                this.grade = (data.total_score==null)?false:String(Math.floor(data.total_score>5?data.total_score:data.total_score*20));
                this.star = this.isWord ? "" : {
                    accuracy: data.accuracy_score,
                    integrity: data.integrity_score,
                    fluency: data.fluency_score
                };
                this.time_len = data.time_len;
                // 原音
                originAudio.setAttribute("src", data.audio_url );
                // 录音
                data.record_url && recordAudio.setAttribute("src", data.record_url);
            },
            submit: function() {
                var _this = this;
                sendAjax(api.submit_record, {data: JSON.stringify(_this.list)}, "POST", function(res){
                    console.log(res);
                });
            },
            playOrigin: function() {
                var _this = this;
                _this.isPronouncing = true;
                originAudio.play();
                originAudio.onended = function() {
                    _this.isPronouncing = false;
                }
            },
            // 播放录音
            playRecord: function() {
                var _this = this;
                if(!_this.list[_this.index].record_url) return false;
                _this.isPlayRecord ? recordAudio.pause() : recordAudio.play();
                _this.isPlayRecord = !_this.isPlayRecord;
                recordAudio.onended = function() {
                    _this.isPlayRecord = false;
                }
            },
            // 录音
            recording: function() {
                var _this = this,
                    ls = _this.list;
                if(_this.isRecording) {
                    // 停止录音
                    _this.isRecording = false;
                    recorder.stop();
                    blobToDataURL(recorder.getBlob(), function(blob){
                        var record = JSON.parse(JSON.stringify(ls[_this.index]));
                        record.category = "read_sentence";
                        record.key = c_key;
                        record.pcm = encodeURIComponent( blob.replace('data:audio/pcm;base64,', '').replace(/^\s+|\s+$/gm,''));
                        // 提交录音
                        sendAjax(api.post_record, {data: JSON.stringify(record) }, 'POST', function(res){
                            ls[_this.index].record_url = res.data.recordUrl;
                            ls[_this.index].total_score = res.data.totalScore;
                            ls[_this.index].integrity_score = res.data.integrityScore||0;
                            ls[_this.index].fluency_score = res.data.fluencyScore||0;
                            ls[_this.index].accuracy_score = res.data.accuracyScore||0;
                            _this.transData(ls[_this.index]);
                        });
                    });
                }else{
                    // 开始录音
                    HZRecorder.get(function (rec) {
                        _this.state = 3;
                        _this.isRecording = true;
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
            // 换页
            pagin: function(d) {
                if(this.isRecording) {
                    msgClose({
                        content: "请稍等，跟读测评中~~~"
                    });
                    return;
                }
                if(this.isPronouncing) {
                    originAudio.pause();
                    this.isPronouncing = false;
                }
                if(this.isPlayRecord) {
                    recordAudio.pause();
                    this.isPlayRecord = false;
                }
                if(d=="left" && this.index-1>=0){
                    this.index=this.index-1;
                }else if(d=="right" && this.index+1<this.list.length) {
                    this.index=this.index+1;
                }
                this.transData(this.list[this.index]);
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