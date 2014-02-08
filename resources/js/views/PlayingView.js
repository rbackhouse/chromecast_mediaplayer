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
define([
		'jquery', 
		'backbone',
		'underscore',
		'chromecast',
		'../uiconfig',
		'text!templates/Playing.html'], 
function($, Backbone, _, chromecastWeb, config, template) {
	var chromecast;
	if (window.cordova) {
		chromecast = ChromecastPlugin;
	} else {
		chromecast = chromecastWeb;
	}
	var View = Backbone.View.extend({
		events: {
			"click #playPause" : function() {
				if (this.state === "play") {
					this.state = "pause";
					$("#playPause .ui-btn-text").html("Play");
					$("#playPause").buttonMarkup({icon : "playIcon" });
					chromecast.pause();
				} else if (this.state === "pause") {
					this.state = "play";
					$("#playPause .ui-btn-text").html("Pause");
					$("#playPause").buttonMarkup({icon : "pauseIcon" });
					chromecast.play();
				} else {
					this.state = "play";
					$("#playPause .ui-btn-text").html("Pause");
					$("#playPause").buttonMarkup({icon : "pauseIcon" });
					var url = this.playing.get("url");
					if (window.cordova) {
						url = config.baseUrl+"/"+url;
					} else {
						url = "http://"+window.location.host+"/"+url;
					}
					chromecast.cast(url);
				}
			},
			"click #stop" : function() {
				this.state = "stopped";
				$("#playPause .ui-btn-text").html("Play");
				$("#playPause").buttonMarkup({icon : "playIcon" });
				chromecast.stopCast();
				$("#currentpos").text("0 mins : 00 secs of [0 mins : 00 secs]");
				$("#position").val(0);
			},
			"change #position" : function() {
				var position = $("#position").val();
				if (position != this.currentPosition) {
					this.currentPosition = position;
					console.log("position set to "+position);
					chromecast.play(position);
				}
			}
		},
		initialize: function(options) {
			this.state = "stopped";
			this.currentPosition = 0;
			this.playing = options.playing;
			this.template = _.template( template, { playing: this.playing.toJSON() } );
			chromecast.addStatusListener(this.statusListener);
		},
		render: function() {
			$(this.el).html( this.template );
			chromecast.addReceiverListener(function() {
				$("#statusMessage").text("Receiver available");
				$("#playPause").removeClass( "ui-disabled" );
				$("#stop").removeClass( "ui-disabled" );
			}.bind(this));
		},
		statusListener: function(status) {
			var duration = Math.floor(status.duration);
			var durmins = Math.floor(duration / 60);
			var dursecs = duration - durmins * 60;
			dursecs = (dursecs < 10 ? '0' : '') + dursecs;
			
			var position = Math.floor(status.position);
			var minutes = Math.floor(position / 60);
			var seconds = position - minutes * 60;
			seconds = (seconds < 10 ? '0' : '') + seconds;
			$("#currentpos").text(minutes+" mins : "+seconds + " secs of ["+durmins+" mins : "+dursecs+" secs]");
			var currentDuration = $("#position").attr("max");
			
			if (duration > 0 && parseInt(currentDuration) !== duration) {
				console.log("position: "+position+" currentDuration:"+currentDuration+ " "+minutes+" mins : "+seconds + " secs of ["+durmins+" mins : "+dursecs+" secs]");
				$("#position").attr("max", duration);
				$("#position").slider('refresh');
			}
			if (status.statusMessage) {
				$("#statusMessage").text(status.statusMessage);
			}
			if (status.state === "PLAYING") {
				this.state = "play";
				$("#playPause .ui-btn-text").html("Pause");
				$("#playPause").buttonMarkup({icon : "pauseIcon" });
			}
		}
	});
	
	return View;
});
