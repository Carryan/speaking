/**
 * Lib to help the recording of user's microphone
 *
 * @param string script_base Base URL to this directory
 * @param string url URL used to send the audio data to the server
 * @param HTMLElement el HTML element where the SWF of Wami will be placed
 * @param string [save_url] Saving URL (if it differs from the URL where the audio data is sent)
 * @param function [onReadyCb] Callback function fired when SWF is ready
 * @uses Wami http://code.google.com/p/wami-recorder/
 */
function FlashRecorder(baseUrl, onReady, config) {
	var sampleRate = config && config.sampleRate ?  config.sampleRate : 16000;
	var numChannels = config && config.channels ? config.channels : 1;
	// removes the flash container, if exists
    $('body').find('#flashObject').remove();
    // adds the flash container
    $('body').append('<div id="flashObject"></div>');
    Wami.setup({
    	id: 'flashObject', 
    	swfUrl: baseUrl + "/flash/Wami.swf", 
    	onReady: onReady, 
    	audioParams: { 
    		sampleRate: sampleRate, 
    		numChannels: numChannels 
    	} 
    });
}

/**
 * Start to capture de audio.
 */
FlashRecorder.prototype.start = function(url, startfn, finishedfn, failedfn) {
	Wami.startRecording(
		url,
		Wami.nameCallback(startfn),
		Wami.nameCallback(finishedfn),
		Wami.nameCallback(failedfn)
	);
};
/**
 * Stop the capture of the audio.
 */
FlashRecorder.prototype.stop = function() {
	Wami.stopRecording();
	Wami.stopPlaying();
};
/**
 * Play the audio sent to the server. Server must serve the Wav file
 */
FlashRecorder.prototype.play = function(startfn, finishedfn, failedfn) {
	Wami.startPlaying(
		this.url,
		Wami.nameCallback(startfn),
		Wami.nameCallback(finishedfn),
		Wami.nameCallback(failedfn)
	);
};
/**
 * Stop the audio preview
 */
FlashRecorder.prototype.pause = function() {
	Wami.stopPlaying();
};
/**
 * saves the audio in the server
 */
FlashRecorder.prototype.save = function(fn) {
	
};
