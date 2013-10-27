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
		'text!templates/MediaList.html'], 
function($, Backbone, _, template){
	var View = Backbone.View.extend({
		events: {
			"click #mediaList li" : "aetPlaying",
			"click #reload" : function() {
				this.mediaList.url +="/reload";
				this.mediaList.fetch({
					success: function(collection, textStatus, jqXHR) {
						this.mediaList.url = "./rest/media";
						$("#mediaList li").remove();
						this.mediaList.each(function(media) {
							$("#mediaList").append('<li><a href="#playing" id="'+media.get("id")+'">'+media.get("name")+'</a></li>');	
						}.bind(this));
						$("#mediaList").listview('refresh');
					}.bind(this),
					error: function(jqXHR, textStatus, errorThrown) {
						console.log("download error : "+textStatus);
					}
				});
			}
		},
		initialize: function(options) {
			this.mediaList = options.medialist;
			this.template = _.template( template, { mediaList: options.medialist.toJSON() } );
		},
		render: function(){
			$(this.el).html( this.template );
		},
		aetPlaying: function(evt) {
			$.ajax({
				url: "./rest/playing/"+evt.target.id,
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
		}
	});
	
	return View;
});
