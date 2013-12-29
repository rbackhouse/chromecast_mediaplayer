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

var applicationID = 'Change Me';
var castApi;
var receivers;
var selectedReceiver;
var currentActivity;
var statusListeners = [];
var callbacks = [];

var initializeCastApi = function() {
  	castApi = new cast.Api();
	castApi.addReceiverListener(applicationID, function(list) {
		receivers = [];
		if (list.length > 0) {
			selectedReceiver = list[0];
		}
  		list.forEach(function(receiver) {
  			console.log("adding receiver : "+receiver.name);
  			receivers.push(receiver);
  		});
  		callbacks.forEach(function(cb) {
  			cb(receivers);
  		});
  		callbacks = [];
  	});
};

if (window.cast && window.cast.isAvailable) {
	initializeCastApi();
} else {
	window.addEventListener("message", function(event) {
    	if (event.source == window && event.data && event.data.source == "CastApi" && event.data.event == "Hello"){
      		initializeCastApi();
    	}
  	});
}

var statusListener = function(mediaPlayerStatus) {
	var status = {state: mediaPlayerStatus.state, position: mediaPlayerStatus.position, duration: mediaPlayerStatus.duration};
	statusListeners.forEach(function(listener) {
		listener(status);
	});
};

define(
['jquery'],
function($) {
	return {
		cast: function(mediaurl) {
			if (currentActivity) {
				return;
			}
			var launchRequest = new cast.LaunchRequest(applicationID, selectedReceiver);
			launchRequest.parameters = '';

			var loadRequest = new cast.MediaLoadRequest(mediaurl);
			loadRequest.autoplay = true;

			castApi.launch(launchRequest, function(activity) {
				if (activity.status == 'running') {
					this._setActivity(activity.activityId);
					castApi.addMediaStatusListener(currentActivity, statusListener);
					castApi.loadMedia(currentActivity, loadRequest, function(mediaResult) {
						console.log("loadMedia: "+JSON.stringify(mediaResult));
					});
    			} else {
      				console.log('Launch failed: ' + activity.errorString);
    			}
  			}.bind(this));
		},
		pause: function() {
			if (currentActivity) {
				castApi.pauseMedia(currentActivity, function(mediaResult) {
					console.log("pauseMedia: "+JSON.stringify(mediaResult));
				});
			}			
		},
		play: function(position) {
			if (currentActivity) {
				var mediaPlayRequest = position ? new cast.MediaPlayRequest(position) : new cast.MediaPlayRequest();
				castApi.playMedia(currentActivity, mediaPlayRequest, function(mediaResult) {
					console.log("playMedia: "+JSON.stringify(mediaResult));
				});
			}			
		},
		stopCast: function() {
			if (currentActivity) {
				castApi.stopActivity(currentActivity, function(mediaResult) {
					console.log("stopActivity: "+JSON.stringify(mediaResult));
				});
				castApi.removeMediaStatusListener(currentActivity, statusListener);
				this._clearActivity();
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
		setCurrentActivity: function(activity) {
			currentActivity = activity;
		},
		getReceivers: function(cb) {
			if (receivers) {
				cb(receivers);
			} else {
				callbacks.push(cb);
			}
		},
		setReceiver: function(index) {
			selectedReceiver = receivers[index];
		},
		_setActivity: function(activityId) {
			currentActivity = activityId;
			this.statusCheckerId = setInterval(function() {
				castApi.getMediaStatus(currentActivity, function(mediaStatus) {
					if (mediaStatus.status) {
						statusListener(mediaStatus.status);
						if (mediaStatus.status.position > 0) {
							this._setPosition(mediaStatus.status);
						}
					}
				}.bind(this));
			}.bind(this), 1000);
			$.ajax({
				url: "./rest/activity/"+activityId,
				type: "PUT",
				headers: { "cache-control": "no-cache" },
				contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
				dataType: "text",
				success: function(data, textStatus, jqXHR) {
					console.log(data);
				}.bind(this),
				error: function(jqXHR, textStatus, errorThrown) {
					console.log("download error : "+textStatus);
				}
			});
		},
		_clearActivity: function() {
			clearInterval(this.statusCheckerId);
			currentActivity = undefined;
			$.ajax({
				url: "./rest/activity",
				type: "DELETE",
				headers: { "cache-control": "no-cache" },
				contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
				dataType: "text",
				success: function(data, textStatus, jqXHR) {
					console.log(data);
				}.bind(this),
				error: function(jqXHR, textStatus, errorThrown) {
					console.log("download error : "+textStatus);
				}
			});
			$.ajax({
				url: "./rest/position",
				type: "DELETE",
				headers: { "cache-control": "no-cache" },
				contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
				dataType: "text",
				success: function(data, textStatus, jqXHR) {
				}.bind(this),
				error: function(jqXHR, textStatus, errorThrown) {
					console.log("download error : "+textStatus);
				}
			});
		},
		_setPosition: function(status) {
			$.ajax({
				url: "./rest/position/"+status.position+"/"+status.duration,
				type: "PUT",
				headers: { "cache-control": "no-cache" },
				contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
				dataType: "text",
				success: function(data, textStatus, jqXHR) {
					//console.log(data);
				}.bind(this),
				error: function(jqXHR, textStatus, errorThrown) {
					console.log("download error : "+textStatus);
				}
			});
		}
	};
});