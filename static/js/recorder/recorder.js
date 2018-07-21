
(function( global ){

	var isFlashMod,
	    userMedia,
		recObject,
		isReady,
		onSuccess,
		onError,
		onStart;

	function AudioRecorder(config){
		this.config = config;
		var baseUrl = config.baseUrl || '';

		onSuccess = config.onSuccess;
		onError = config.onError;
		onStart = config.onStart;
		/*
		** 判断是否支持H5 录音
		 */
		try{
	      	userMedia = navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia; 
	    }catch(e) {
	        isFlashMod = true;
	    }

		this.type = isFlashMod ? "flash" : "h5";

		if(!isFlashMod){
			require(['h5Rcorder'], function(){ // 异步加载
				HZRecorder.get(function (rec) {
					recObject = rec;
					isReady = true;
					config.onReady && config.onReady();
				}, config);
			});
		}else{
			require(['swfobject', 'wami', 'flashRecorder'], function(){
				recObject = new FlashRecorder( baseUrl, function(){ isReady = true; config.onReady && config.onReady()}, config );
			});
		}

	}

	//params为要上传的数据
	AudioRecorder.prototype.start = function(data){
		var config = this.config,
			uploadUrl = config.uploadUrl;
			config.data = data;

		if( isReady ){

			if( !isFlashMod ){
				recObject.start( onStart );
			}else{
				recObject.start( 
					uploadUrl + "?key=" + (data ? data.key : '') + "&id=" + (data ? data.id : ''), 
					onStart, 
					function(){
						$.ajax({
							url: uploadUrl,
							type: 'POST',
							data: { data: JSON.stringify( data ), flashMod: true }
						}).done(function(res) {
			                onSuccess && onSuccess(res);
			            }).fail(function(res) {
			                onError && onError(res);
			            });
					},
					onError);
			}

		}
	}

	AudioRecorder.prototype.stop = function(){
		recObject.stop();
		!isFlashMod && recObject.upload(
			this.config.uploadUrl, 
			{data: JSON.stringify( this.config.data )}, 
			function(state, res){ 
				switch (state) {
                    case 'success':
					    onSuccess && onSuccess(res);
                        break;
                    case 'error':
                        onError && onError(res);
                        break;
                } 
			});
	}

	global.AudioRecorder = AudioRecorder;

})( window );