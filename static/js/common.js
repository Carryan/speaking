// 异步加载文件
var classcodes = []; //已加载文件缓存列表,用于判断文件是否已加载过，若已加载则不再次加载
window.Import = {
    /*加载一批文件，_files:文件路径数组,可包括js,css,less文件,succes:加载成功回调函数*/
    LoadFileList: function (_files, succes) {
        var FileArray = [];
        if (!arguments[1]) {
            var succes = function(){};
        }
        if (typeof _files === "object") {
            FileArray = _files;
        } else {
            /*如果文件列表是字符串，则用,切分成数组*/
            if (typeof _files === "string") {
                FileArray = _files.split(",");
            }
        }
        if (FileArray != null && FileArray.length > 0) {
            var LoadedCount = 0;
            for (var i = 0; i < FileArray.length; i++) {
                loadFile(FileArray[i], function () {
                    LoadedCount++;
                    if (LoadedCount == FileArray.length) {
                        succes();
                    }
                })
            }
        }
        /*加载JS文件,url:文件路径,success:加载成功回调函数*/
        function loadFile(url, success) {
            if (!FileIsExt(classcodes, url)) {
                var ThisType = GetFileType(url);
                var fileObj = null;
                if (ThisType == ".js") {
                    fileObj = document.createElement('script');
                    fileObj.src = url;
                } else if (ThisType == ".css") {
                    fileObj = document.createElement('link');
                    fileObj.href = url;
                    fileObj.type = "text/css";
                    fileObj.rel = "stylesheet";
                } else if (ThisType == ".less") {
                    fileObj = document.createElement('link');
                    fileObj.href = url;
                    fileObj.type = "text/css";
                    fileObj.rel = "stylesheet/less";
                }
                success = success || function () { };
                fileObj.onload = fileObj.onreadystatechange = function () {
                    if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
                        success();
                        classcodes.push(url)
                    }
                }
                document.getElementsByTagName('head')[0].appendChild(fileObj);
            } else {
                success();
            }
        }
        /*获取文件类型,后缀名，小写*/
        function GetFileType(url) {
            if (url != null && url.length > 0) {
                return url.substr(url.lastIndexOf(".")).toLowerCase();
            }
            return "";
        }
        /*文件是否已加载*/
        function FileIsExt(FileArray, _url) {
            if (FileArray != null && FileArray.length > 0) {
                var len = FileArray.length;
                for (var i = 0; i < len; i++) {
                    if (FileArray[i] == _url) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}

//获取common.js所在路径
var scripts = document.scripts,
	JSPATH = '';
for( var i = 0; i < scripts.length; i++ ){
	if ( /common\.js/.test(scripts[i].src) ){
		JSPATH = scripts[i].src.replace(/common\.js/, '');
		break;
	}
}

//获得距离window顶部偏移距离
function getOffsetTop( height ){ 
    //window.parent父级窗口 等于 window.top顶层窗口
	if( parent === top && window !== top ){ 
		var navBarH = $('#navbar', parent.document)[0] ? $('#navbar', parent.document).height() : 0,
			 scrollTop = $(parent.document).scrollTop();
		return scrollTop + (height && parseInt( height ) > 0 ?  ($(parent).height() - parseInt(height) - navBarH)/2 - (scrollTop > 0 ? 45/2 : 0) : 60) + 'px';
	}
	return 'auto';
}

//重新刷新页面，使用location.reload()有可能导致重新提交
function reload(win) {
    win = win || window;
    var location = win.location;
    location.href = location.pathname + location.search;
}

// 重定向
function redirect(url) {
	location.href = url;
}

// 后退
function back() {
	history.back();
}

//只能输入数字 限制小数format="#.##"
$(document).on('keyup', 'input.js-number', function(e) {
	//排除方向键
	if( e.keyCode >=37 && e.keyCode <=40 || e.keyCode == 8 || e.keyCode == 46 ) return;
	
	var $this = $(this),
		format = $this.data('format'),
		formatArr = format ? format.split('.') : [],
	    val = $this.val();

	formatArr.length <= 1 && $this.val( val.replace(/[^\d]/g, '') )
	if ( formatArr.length == 2 ) {
		var limit = formatArr[1].length;
		var reg =new RegExp('^(\\-)*(\\d+)\\.(\\d{'+limit+'})(\\d+)$');
		$this.val( val.replace(/[^\d|\.]/g, '').replace(/^\./, '').replace(/\.{2,}/g,".").replace(/(\d+\.\d+)\./,'$1').replace(reg,'$1$2.$3') );
	}
});

function loadApp(layui){
    //非script引入layui需配置路径
	layui.config({
		dir: JSPATH+'layui/'
	});

    /*ajax提交form表单*/
	(function(form){
		if( !form[0] ) return;
		layui.use('layer', function(){
			var layer = layui.layer;
            var action = form.prop('action');

            form.find('[type="submit"], .js-ajax-submit').on('click', function(event){
                event.preventDefault();
                var $this = $(this),
                    msg = $this.attr('data-msg');
                action = $this.data('action')? $this.data('action'): form.prop('action'); //是否重设action
                if(msg){
                    layer.confirm(msg, {title:'提示'}, function(index){
                        $this.attr('disabled', 'disabled');
                        form.submit();
                        layer.close(index);
                    });
                }else{
                    $this.attr('disabled', 'disabled');
                    form.submit();
                }
            });

			form.on('submit', function(event){
				var $this = $(this),
					method = $this.prop('method') || 'post',
					unreload = typeof $this.attr('unreload') != 'undefined',
					callback = $this.find('.js-ajax-callback'),
					loading;

				if( form.data('loading') ) return false;

				$.ajax({
					url: action,
					type: method,
					data: $this.serialize(),
					dataType: 'json',
					beforeSend: function(){
						$this.data('loading', true);
						loading = layer.msg('请稍后...', {
						  icon: 16
						  ,shade: 0.01
						  ,time: 100*1000
						  ,offset: getOffsetTop(64)
						});
					},
					success: function(res){
						if( res.state == 'ok' ){
							layer.msg( res.msg ? res.msg : '操作成功!', {icon: 1, offset: getOffsetTop(64)} );
							unreload && $this.data('loading', false) && callback[0] && (new Function( callback.html() )()).call(null, res, layer);
							!unreload && setTimeout( function(){
	                       		if ( res.jump ) {
	                       			window.location.href = res.jump; //返回带跳转地址
	                            } else {
		                       		reload();//刷新当前页
	                            }
							}, 1000 );
                        }else{
                        	layer.msg( res.msg?res.msg:'操作失败！', {icon: 2, anim: 6, offset: getOffsetTop(64)} );
                        	$this.data('loading', false);
                        }
                        layer.close(loading);
                        form.find('[type="submit"], .js-ajax-submit').removeAttr('disabled');
					},
					error: function(xhr,status,error) {
                        layer.alert(error||'请求失败', {icon: 2, anim: 6, title:'错误'}, function(index){
                            reload();
                        });
                        layer.close(loading);
					}
				});
				return false;
			});

		});
	})( $('form.js-ajax-form') );

    //ajax 按钮，属性：unreload、callback、data-msg
	(function($btn){
		if( !$btn[0] ) return;
		layui.use('layer', function(){
			var layer = layui.layer;
			$btn.on('click', function(e){
				e.preventDefault();
				var $this = $(this),
					url = $this.data('href') || $this.prop('href'),
					unreload = typeof $this.attr('unreload') != 'undefined',
					callback = $this.attr('callback'),
					msg = $this.data('msg') || '你要进行此操作吗？',
                    offset = $this.offset(),
                    offsetTop = offset.top-$(window).scrollTop(),
                    offsetLeft = offset.left-$(window).scrollLeft(),
                    top = offsetTop+120>$(window).height()? offsetTop-125: offsetTop+$this.height()+10,
                    left = offsetLeft+260+$this.width()>$(window).width()? $(window).width()-270: offsetLeft+$this.width()+10;

				layer.confirm( msg, { 
					title: false,
					shade : 0,
					area: ['260px', 'auto'],
					offset: [top+'px', left+'px']
				}, function(){
					$.getJSON(url).done(function(res){
						if ( res.state == 'ok' ) {
                            if ( res.jump ) {
                                location.href = res.jump;
                            } else {
                            	unreload ? layer.msg( res.msg ? res.msg : '操作成功!', {icon: 1, offset: getOffsetTop(64)} ) : reload(window);
                            	unreload && callback &&  (new Function( callback ))();
                            }
                        } else {
                        	layer.msg( res.msg, {icon: 2, anim: 6} );
                        }
					});
				});
			});
		});
	})( $('.js-ajax-btn') );

    //日期选择器
	(function($date){
		if( !$date[0] ) return;
		layui.use('laydate', function(){
			var laydate = layui.laydate;
			$date.each(function(){
				var $this = $(this),
					format = $this.attr('format') || 'yyyy-MM-dd',
					type  = 'date';
				$.each(['time', 'month', 'year', 'datetime'], function(i, el){ 
					if( $this.is('.js-'+el) ){
						type = el;
						return false;
					}
				});
				laydate.render({
					elem: this
					,theme: '#34a8ea'
					,type: type
					,format: format
				});
			});
		});
	})( $('input.js-date, input.js-year, input.js-time, input.js-month, input.js-datetime') );

    // iframe弹窗, .js-close-iframe 关掉弹框
	window.openDialog = function (url, title, option){
        var op = option || {};
        var area = [op.width||'80%', op.height||'560px'];
		layui.use('layer', function(){
			var layer = layui.layer,
				 offsetTop = op.offset || getOffsetTop( area[1]);
			layer.open({
				title: !title && title == '' ? false : title,
				type: 2,
				area: area,
				offset: offsetTop,
				content: url,
				btn: op.btn || false,
				btnAlign: op.btnAlign ||'c',
				success: function(layero, index){
					layer.getChildFrame('body', index).find('.js-close-iframe').on('click', function(){ layer.close( index ) } );
				}
			});
		});
	}

    // 提示框
    window.msgSuccess = function (msg) {
        layer.msg(msg||"操作成功", {icon: 1, time: 2000}); 
    }
    window.msgError = function (msg) {
        layer.msg(msg||"操作失败", {icon: 2, time: 2000}); 
    }
    window.msgWarning = function (msg) {
        layer.msg(msg||"警告", {icon: 7, time: 2000}); 
    }
    window.msgInfo = function (msg) {
        layer.msg(msg||"提示", {icon: 6, time: 2000}); 
    }

}

if(typeof layui === 'undefined') {
    Import.LoadFileList([JSPATH+'layui/css/layui.css', JSPATH+'layui/layui.js'], function(){
        loadApp(layui);
    });
}else{
    loadApp(layui);
}

// 表单验证
function verify_msg(objs, isReturnValue) {
    var msg = "";
    var values = {};
    objs.each(function(){
        var _this = $(this);
        var value = _this.val();
        if(value == null) value = "";
        if(_this.is('[type="text"], textarea')) {
            value = value.trim();
        }
        
        if(_this.attr("verify-require")){
            if(!/\S+/.test(value)){
                msg = _this.attr("verify-require");
                return false;
            }
        }

        if(_this.attr("verify-number")){
            if(!/^[0-9]+$/.test(value)) {
                msg = _this.attr("verify-number");
                return false;
            }
        }
        
        if(isReturnValue) values[_this.attr("name")] = value;
    });

    if(msg){
        if(typeof layer === 'undefined'){
            Import.LoadFileList([JSPATH+'layui/css/layui.css', JSPATH+'layui/layui.js'], function(){
                layer.msg(msg, { icon: 2, anim: 6, time: 3*1000 });
            });
        }else{
            layer.msg(msg, { icon: 2, anim: 6, time: 3*1000 });
        }
        return false;
    }else{
        return isReturnValue?values:true;   
    }
}