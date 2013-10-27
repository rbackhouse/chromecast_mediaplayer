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
	'jquerymobile',
	'models/MediaList',
	'views/MediaListView',
	'models/PlayMedia',
	'views/PlayingView'
	], 
function($, Backbone, _, mobile, MediaList, MediaListView, PlayMedia, PlayingView) {
	var Router = Backbone.Router.extend({
		initialize: function(options) {
			$('.back').on('click', function(event) {
	            window.history.back();
	            return false;
	        });
	        this.firstPage = true;			
	        this.on("route:medialist", function() {
	        	this.fetchMediaList();
			});
	        this.on("route:playing", function() {
				this.navigate("playing", {replace: true});
				var playing = new PlayMedia();
				playing.fetch({
					success: function(model, response, options) {
						this.currentView = new PlayingView({playing: model});
						this.changePage(this.currentView);
					}.bind(this),
					error: function(collection, xhr, options) {
						console.log("failed!!!");
					}
				});
			});
			Backbone.history.start();
		},
		fetchMediaList: function() {
			this.navigate("medialist", {replace: true});
			if (this.currentView) {
			}
			var medialist = new MediaList();
			medialist.fetch({
				success: function(collection, response, options) {
					this.currentView = new MediaListView({medialist: collection});
					this.changePage(this.currentView);
				}.bind(this),
				error: function(collection, xhr, options) {
					console.log("failed!!!");
				}
			});
		},
	    changePage:function (page) {
	        $(page.el).attr('data-role', 'page');
	        page.render();
	        $('body').append($(page.el));
	        mobile.changePage($(page.el), {changeHash:false, reverse: false});
	    },
		routes: {
			'playlist': 'playlist',
			'medialist': 'medialist',
			'playing': 'playing',
			'': 'medialist'
		}
	});
	
	return Router;
});
