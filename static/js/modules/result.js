define(['starbar', 'recorder'], function(starbar){
    
    var api = getApi();
    var c_key;
    var originAudio, recordAudio;
    var recorder;
    var waitReady;
    var waitResult;

    var component = {
        props: ['nav', 'rtitle'],
        components: {
            'starbar': starbar
        },
        template: '<div class="speaking-result">'+
                    '<p class="title" v-if="state>0">{{ title }}</p>'+
                    '<div class="list-box">'+
                        '<table class="list">'+
                            '<thead v-if="title">'+
                                '<tr>'+
                                    '<td>原音</td> <td>录音</td> <td>重做</td> <td>得分</td> <td>答题情况</td>'+
                                '</tr>'+
                            '</thead>'+
                            '<tbody v-if="list.length">'+
                                '<tr v-for="(v, i) in cur_list" :key="i">'+
                                    '<td>'+
                                        '<a href="javascript:;" class="origin-btn sp-icon" :class="{playing: v.play_audio}" @click="playAudio(i)"></a>'+
                                    '</td>'+
                                    '<td>'+
                                        '<a href="javascript:;" class="mine-btn sp-icon" :class="{playing: v.play_record}" @click="playRecord(i)"></a>'+
                                    '</td>'+
                                    '<td>'+
                                        '<a href="javascript:;" class="start-btn sp-icon" :class="{playing: v.recording}" @click="recording(i)"></a>'+
                                    '</td>'+
                                    '<td>'+
                                        '<span v-if="v.score" class="grade">{{ v.score }}</span>'+
                                        '<span v-else>未做</span>'+
                                    '</td>'+
                                    '<td class="detail" v-if="v.category==\'read_sentence\'">'+
                                        '<div class="sentence" v-html="strToHtml(v.content)||v.words"></div>'+
                                        '<starbar '+
                                            ':data="v.star">'+
                                        '</starbar>'+
                                    '</td>'+
                                    '<td class="detail" v-else>'+
                                        '<div class="word">{{ v.words }}</div>'+
                                        '<div class="pronounce">[<span>{{ v.symbol }}</span>]</div>'+
                                        // '<div class="pronounce">[<span v-html="strToHtml(v.content)"></span>]</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                        '<div class="loading loading-active" v-show="state==1"></div>'+
                        '<div class="empty-tip" v-if="!cur_list.length&&state==2">暂无错题</div>'+
                    '</div>'+
                    '<div class="bottom" v-if="nav!=4">'+
                        '<a href="javascript:;" class="page-btn" v-show="cur_page>1" @click="page(-1)">上一课</a>'+
                        '<a href="javascript:;" class="return-btn" @click="back">返回</a>'+
                        '<a href="javascript:;" class="page-btn" v-show="cur_page<total_pages" @click="page(1)">下一课</a>'+
                    '</div>'+
                    '<audio id="originVoice" autoplay="autoplay"></audio>'+
                    '<audio id="recordVoice" autoplay="autoplay"></audio>'+
                '</div>',
        data: function () {
            return {
                list: [],
                cur_list: [],
                cur_page: 1,
                cur_index: null,
                isReady: false,
                isChecking: false,
                state: 0 // 0-unload, 1-loading, 2-loaded, 3-recording, 4-recorded
            }
        },
        computed: {
            title: function() {
                var t = "",
                    rt = this.rtitle,
                    route = this.$route; 
                if(rt) {
                    if(route.name=="result"){
                        t = this.rtitle+" 得分详情";
                    }else if(route.name=="record_detail"){
                        t = this.rtitle;
                    }
                }else{
                    t = localStorage.getItem("rtitle");
                }
                if(route.name=="err"){
                    t = route.query.unit ? this.rtitle : "";
                }
                return t;
            },
            total_pages: function() {
                return Math.ceil(this.list.length/this.list_len);
            },
            list_len: function() {
                if(this.nav==1||this.$route.query.category=="read_word") {
                    return 5;
                }else{
                    return 4;
                }
            }
        },
        watch: {
            '$route': function(to, from) {
                var n = to.name;
                if(n=="result"||n=="record_detail"||n=="err") this.setData();
            },
            'isReady': function(v) {
                v && waitReady && layer.close(waitReady);
            }
        },
        created: function() {
            this.setData();
        },
        mounted: function() {
            // 存储标题
            if(this.rtitle) {
                localStorage.setItem("rtitle", this.rtitle);
            }
            
            var _this = this;
            originAudio = document.getElementById('originVoice');
            recordAudio = document.getElementById('recordVoice');
            
        }, 
        methods: {
            init: function() {
                this.cur_page = 1;
                this.cur_index = null;
                this.state = 0;
            },
            setData: function() {
                var _this = this,
                    route = _this.$route;

                var cate="", bcId="";
                if(this.nav==1){
                    cate = "read_word";
                }else if(this.nav==2){
                    cate = "read_sentence";
                }else if(this.nav==3){
                    cate = this.$route.query.category;
                }else{
                    cate = "both"; //错误页
                }

                if(route.name=="record_detail"){
                    bcId = route.query.bookCatalogId;
                }else{
                    bcId = route.query.unit;
                }
                
                if(cate && bcId){
                    var p_data;
                    if(cate=="both") {
                        p_data = {bookCatalogId: bcId, showAll: false, totalScoreLimit: "4.5"};
                    }else{
                        p_data = {category: cate, bookCatalogId: bcId};
                    }
                    sendAjax(api.get_content, p_data, 'GET', function(res){
                        _this.list = res.data.list;
                        c_key = res.data.key;
                        _this.getCurList();
                        _this.init();
                        _this.setRecorder(); //录音器
                    }, function(){//请求发送前
                        _this.state = 1;
                    }, function(){//请求完成后
                         _this.state = 2;
                    });
                }else{
                    _this.list = [];
                    _this.cur_list = [];
                   _this.init();
                }
                
            },
            getCurList: function() {
                var cur_list = [];
                var start = (this.cur_page-1)*this.list_len,
                    end = (start+this.list_len>this.list.length)? this.list.length: start+this.list_len;
                for(var i=start; i<end; i++) {
                    var cl = this.list[i];
                    cur_list.push({
                        category: cl.category,
                        score: (cl.total_score==null)?"":String(Math.floor(cl.total_score>5 ? cl.total_score : cl.total_score*20)),
                        words: cl.words,
                        content: cl.content,
                        symbol: cl.symbol,
                        translations: cl.translations,
                        star: {
                            accuracy: cl.accuracy_score||0,
                            integrity: cl.integrity_score||0,
                            fluency: cl.fluency_score||0
                        },
                        audio_url: cl.audio_url,
                        record_url: cl.record_url,
                        time_len: cl.time_len,
                        play_audio: false,
                        play_record: false,
                        recording: false
                    });
                }
                this.cur_list = cur_list;
            },
            back: function() {
                this.$router.go(-1);
            },
            playAudio: function(index) {
                var url = this.cur_list[index].audio_url;
                if(!url) {
                    msgWarning("暂时没有原音");
                    return false;
                }
                this.cur_list.forEach(function(v, i){
                    if(i==index){
                        originAudio.setAttribute('src', url);
                        v.play_audio = true;
                        originAudio.onended = function() {
                            v.play_audio = false;
                        }
                        originAudio.onerror = function() {
                            // 音频失效
                            console.log("音频失效");
                        }
                    }else{
                        if(v.play_audio) v.play_audio = false;
                    }
                });
            },
            playRecord: function(index) {
                var url = this.cur_list[index].record_url
                if(!url) return false;
                this.cur_list.forEach(function(v, i){
                    if(i==index){
                        recordAudio.setAttribute('src', url);
                        v.play_record = true;
                        recordAudio.onended = function() {
                            v.play_record = false;
                        }
                        recordAudio.onerror = function() {
                            // 音频失效
                            console.log("音频失效");
                        }
                    }else{
                        if(v.play_record) v.play_record = false;
                    }
                });
            },
            setRecorder: function(readyCallback, index) {
                var _this = this;
                recorder = new AudioRecorder({
                    baseUrl: 'static/js/recorder/',
                    uploadUrl: api.post_record,
                    onSuccess: function(res){
                        // console.log(res);
                        layer.close(waitResult);
                        _this.isChecking = false;
                        if( res && res.state == 'ok' ){
                            var rd = res.data;
                            var cl = _this.list[_this.cur_index];
                            cl.key = rd.key;
                            cl.record_url = rd.recordUrl;
                            cl.total_score = rd.totalScore;
                            cl.integrity_score = rd.integrityScore||0;
                            cl.fluency_score = rd.fluencyScore||0;
                            cl.accuracy_score = rd.accuracyScore||0;
                            cl.content = rd.content.replace(/</g,"&lt;").replace(/>/g, "&gt;");
                            _this.getCurList();
                            // 保存
                            $.ajax({
                                url: api.submit_record,
                                type: 'POST',
                                data: {data: JSON.stringify(_this.list)},
                                success: function(res) {
                                    console.log(res);
                                },
                                error: function(xhr,status,error) {
                                    console.log(error);
                                }
                            });
                        }else{
                            msgClose({content: res.msg||"测评失败，请重试"});
                        }
                    },
                    onReady: function() {
                        _this.isReady = true;
                        readyCallback && readyCallback(index);
                    },
                    onError: function(res){
                        msgClose({content: res||"当前无法测评", time: 3000});
                        _this.isReady = false;
                    }
                });
            },
            startRecord: function(index) {
                var _this = this,
                    cl = _this.cur_list[index];
                cl.recording = true;
                _this.cur_index = _this.cur_page-1+index;
                var record = JSON.parse(JSON.stringify(_this.list[_this.cur_index]));
                // record.category = "read_sentence"; // 只检验句子类型
                if(!record.key) record.key = c_key;
                recorder.start( record );
                // 限制录音时间
                setTimeout(function(){
                    if(cl.recording) {
                        cl.recording = false;
                        recorder.stop();
                    }
                }, cl.time_len*1000||5*1000);
            },
            recording: function(index) {
                var hasRecording = this.cur_list.some(function(v, i){
                    return v.recording==true&&i!=index;
                });
                if(hasRecording||this.isChecking) { //其他元素是否在录制
                    return false;
                }else{
                    if(this.cur_list[index].recording){
                        this.cur_list[index].recording = false;
                        recorder.stop();
                        this.isChecking = true;
                        waitResult = layer.msg('正在测评...', {icon: 16, time:10*1000});
                    }else{
                        // 开始录音
                        if(recorder.type=="h5"){
                           this.isReady ? this.startRecord(index) : this.setRecorder(this.startRecord, index);
                        }else{
                            if(this.isReady) {
                                this.startRecord(index);
                            }else{
                                waitReady = layer.open({
                                    content: "正在调用麦克风...",
                                    title: " ",
                                    shade: 0,
                                    btn: false,
                                    resize: false,
                                    area: 'auto',
                                    skin: "msg-close"
                                });
                            }
                        }
                    }
                }
            },
            page: function(d) {
                this.cur_page = this.cur_page+d;
                this.getCurList();
            }
        }
    }

    return component;
});