/*
* The MIT License (MIT)
* 
* Copyright (c) 2013 Richard Backhouse
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/

define(function() {
	var currentMedia;
	var session;

	var statusListeners = [];
	var callbacks = [];
	var available = false;

	var initializeCastApi = function() {
		var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
		var sessionRequest = new chrome.cast.SessionRequest(applicationID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest, 
			function(e) {
				session = e;
				currentMedia = session.media[0];
				currentMedia.addUpdateListener(updateListener);
				updateListener();
			}, 
			function(e) {
				if (e === 'available') {
					available = true;
					callbacks.forEach(function(cb) {
						cb();
					});
				}
			}
		);

		chrome.cast.initialize(apiConfig, 
			function() {
				console.log("onInitSuccess");
			}, 
			function(error){
				console.log("onError");
			}
		);
	};

	if (!chrome.cast || !chrome.cast.isAvailable) {
		setTimeout(initializeCastApi, 1000);
	}

	var updateListener = function(isAlive) {
		var status = {
			isAlive: isAlive,
			state: currentMedia.playerState, 
			position: currentMedia.currentTime, 
			duration: currentMedia.media.duration,
			playbackRate: currentMedia.playbackRate,
			statusMessage: currentMedia.playerState
		};
		statusListeners.forEach(function(listener) {
			listener(status);
		});
	};

	return {
		cast: function(mediaurl) {
			if (!session) {
				chrome.cast.requestSession(
					function(e) {
						session = e;
						this._loadUrl(mediaurl);
					}.bind(this), 
					function(error) {
						console.log("cast error : "+error);
					}
				);	
			}
		},
		pause: function() {
			if (currentMedia) {
				currentMedia.pause(null, 
					function() {
						console.log("Paused");
					}, 
					function(error) {
						console.log("pause error");
					}
				);
			}			
		},
		play: function(position) {
			if (currentMedia) {
				if (position) {
					var seekCommand = new chrome.cast.media.SeekRequest();
					seekCommand.currentTime = position;
				
					currentMedia.seek(seekCommand,
						function() {
							console.log("Seeked");
						}, 
						function(error) {
							console.log("seek error");
						}
					);
				} else {
					currentMedia.play(null, 
						function() {
							console.log("Playing");
						}, 
						function(error) {
							console.log("play error");
						}
					);
				}
			}			
		},
		stopCast: function() {
			if (currentMedia) {
				currentMedia.stop(null, 
					function() {
						console.log("stopActivity: ");
						currentMedia.removeUpdateListener(updateListener);
						currentMedia = undefined;
						session.stop(
							function() {
								console.log("Stopped");
								session = undefined;
							}, 
							function(error) {
								console.log("stop session error : "+error);
								session = undefined;
							}
						);
					}, 
					function(error) {
						console.log("stop error : "+error);
						session = undefined;
						currentMedia = undefined;
					}
				);
			}
		},
		addStatusListener: function(listener) {
			statusListeners.push(listener);
		},
		removeStatusListener: function(listener) {
			var index = statusListeners.indexOf(listener);
			if (index > -1) {
				statusListeners.slice(index, 1);
			}
		},
		addReceiverListener: function(cb) {
			if (available) {
				cb();
			} else {
				callbacks.push(cb);
			}
		},
		getState: function() {
			return currentMedia ? currentMedia.playerState : "";
		},
		_loadUrl: function(mediaurl) {
			var mediaInfo = new chrome.cast.media.MediaInfo(mediaurl);
			mediaInfo.contentType = 'video/mp4';
			var request = new chrome.cast.media.LoadRequest(mediaInfo);
			request.autoplay = true;
			request.currentTime = 0;
			session.loadMedia(request, 
				function(media) {
					currentMedia = media;
					currentMedia.addUpdateListener(updateListener);
					updateListener();
				}.bind(this), 
				function(error) {
					console.log("load media error : "+error);
				}
			);
		}
	};
});