define(['starbar', 'recorder'], function(starbar){

    var api = getApi();
    var c_key;
    var originAudio, recordAudio;
    
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
                        '<p class="pronunciation" v-if="isWord" v-show="content.grade">'+
                            '[<span>{{content.pronounce}}</span>]'+
                        '</p>'+
                        '<p v-if="!isWord" class="translate">{{content.cn}}</p>'+
                        '<a href="javascript:;" class="prev-btn sp-icon"'+
                            ' :class="{disabled: index==0}"'+
                            ' @click="pagin(\'left\')"></a>'+
                        '<a href="javascript:;" class="next-btn sp-icon"'+
                            ' :class="{disabled: isLast}"'+
                            ' @click="pagin(\'right\')"></a>'+
                        '<div v-if="content.grade" class="grade"><span>{{content.grade}}</span>分</div>'+
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
                        '<starbar v-if="!isWord&&content.star" :data="content.star"></starbar>'+
                    '</div>'+
                    '<div class="loading loading-active" v-show="state==1"></div>'+
                    '<div class="empty-tip" v-if="!content.en&&state==2">暂无内容</div>'+
                    '<audio id="originVoice" :src="content.audio_url"></audio>'+
                    '<audio id="recordVoice" :src="content.record_url"></audio>'+
                '</div>',
        data: function () {
            return {
                list: [],
                index: 0,
                content: {},
                isPronouncing: false,
                isRecording: false,
                isPlayRecord: false,
                state: 0 // 0-unload, 1-loading, 2-loaded, 3-start, 4-submited
            }
        },
        created: function() {
            this.setData();
        },
        mounted: function () {
            var _this = this;
            recorder = new AudioRecorder({
                baseUrl: 'static/js/recorder/',
                uploadUrl: api.post_record,
                onSuccess: function(res){
                    if( res && res.state == 'ok' ){
                        var rd = res.data;
                        // console.log(rd);
                        _this.list[_this.index].key = rd.key;
                        _this.list[_this.index].record_url = rd.recordUrl;
                        _this.list[_this.index].total_score = rd.totalScore;
                        _this.list[_this.index].integrity_score = rd.integrityScore||0;
                        _this.list[_this.index].fluency_score = rd.fluencyScore||0;
                        _this.list[_this.index].accuracy_score = rd.accuracyScore||0;
                        _this.transData(_this.list[_this.index]);
                    }else{
                        msgError(res.msg);
                    }
                },
                onError: function(res){
                    msgError(res);
                }
            });

            originAudio = document.getElementById('originVoice');
            originAudio.onended = function() {
                _this.isPronouncing = false;
            }
            originAudio.onerror = function() {
                $.ajax({
                    url: api.get_audio,
                    type: 'GET',
                    data: {id: _this.list[_this.index].orals_id},
                    success: function(res) {
                        if(res.state=="ok") {
                            _this.content.audio_url = res.data.audio_url;
                        }else{
                            _this.content.audio_url = "";
                        }
                    },
                    error: function(){
                        _this.content.audio_url = "";
                    }
                });
            }

            recordAudio = document.getElementById('recordVoice');
            recordAudio.onended = function() {
                _this.isPlayRecord = false;
            }
            // 链接失效时
            recordAudio.onerror = function() {
                $.ajax({
                    url: api.get_audio,
                    type: 'GET',
                    data: {id: _this.list[_this.index].orals_id},
                    success: function(res) {
                        console.log(res);
                        if(res.state=="ok") {
                            _this.content.record_url = res.data.record_url;
                        }else{
                            _this.content.record_url = "";
                        }
                    },
                    error: function(){
                        _this.content.record_url = "";
                    }
                });
            }

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
            if(this.state==3&&this.state!=4) {
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
                this.index = 0;
                this.content = {};
                this.isRecording = false;
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
                    sendAjax(api.get_content, {category: cate, bookCatalogId: unit}, 'POST', function(res){
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
                    }, function(){//请求发送前
                        _this.state = 1;
                    }, function(){//请求完成后
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
                    pronounce: data.translations,
                    grade: (data.total_score==null)?false:String(Math.floor(data.total_score>5?data.total_score:data.total_score*20)),
                    star: this.isWord ? "" : {
                        accuracy: data.accuracy_score,
                        integrity: data.integrity_score,
                        fluency: data.fluency_score
                    },
                    audio_url: data.audio_url,
                    record_url: data.record_url
                }
            },
            submit: function() {
                var _this = this;
                console.log(_this.list)
                sendAjax(api.submit_record, {data: JSON.stringify(_this.list)}, "POST", function(res){
                    _this.state = 4;
                    _this.$router.push({name: "result", query: _this.$route.query});
                });
            },
            playOrigin: function() {
                if(!this.content.audio_url) {
                    msgInfo("暂无原音");
                    return false;
                }
                this.isPronouncing = true;
                originAudio.play();
            },
            // 播放录音
            playRecord: function() {
                // if(this.isPlayRecord) {
                //     recordAudio.pause();
                //     this.isPlayRecord = false;
                // }else if(!this.content.record_url){
                //     msgInfo(this.content.grade?"找不到原音":"您还没有录音");
                //     return false;
                // }else{
                //     recordAudio.play();
                //     this.isPlayRecord = true;
                // }
                if(!this.content.record_url){
                    msgInfo(this.content.grade?"找不到录音":"您还没有录音");
                    return false;
                }else{
                    recordAudio.play();
                    this.isPlayRecord = true;
                }
            },
            // 录音
            recording: function() {
                var _this = this,
                    ls = _this.list;
                if(_this.isRecording) {
                    // 停止录音
                    recorder.stop();
                    _this.isRecording = false;
                }else{
                    // 开始录音
                    _this.isRecording = true;
                    _this.state = 3;
                    var record = JSON.parse(JSON.stringify(ls[_this.index]));
                    record.category = "read_sentence"; // 只检验句子类型
                    record.key = c_key;
                    recorder.start( record );
                    // 限制录音时间
                    setTimeout(function(){
                        if(_this.isRecording) {
                            _this.isRecording = false;
                            recorder.stop();
                        }
                    }, ls[_this.index].time_len*1000||5*1000);
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

    return component;
});