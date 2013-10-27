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

var url = require('url');
var path = require('path');
var qs = require('querystring');
var http = require('http');
var fs = require('fs');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function addFile(file) {
	var add = false;
	if (endsWith(file, ".mp4")) {
		add = true;
	//} else if (endsWith(file, ".m4v")) {
		//add = true;
	}
	return add;
}

RestHandler = function(mediadir) {
	this.mediadir = mediadir;
	this.playing = {};
};

RestHandler.prototype = {
	handle: function(request, response, next) {
		var requestURL = url.parse(request.url);
		var path = requestURL.pathname;
		if (path.charAt(0) == '/') {
			path = path.substring(1);
		}
		var segments = path.split("/");
		if (request.method === "GET") {
			this._handleGet(request, response, segments);
		} else if (request.method === "POST") {
			this._handlePost(request, response, segments);
		} else if (request.method === "PUT") {
			this._handlePut(request, response, segments);
		} else if (request.method === "DELETE") {
			this._handleDelete(request, response, segments);
		} else if (request.method === "HEAD") {
			this._handleHead(request, response, segments);
		}
	},
	_handleGet: function(request, response, segments) {
		if (segments.length > 0) {
			if (segments[0] === "media") {
				if (segments.length > 1 && segments[1] === "reload") {
					this.medialist = undefined;
				}
				response.setHeader('Content-Type', '"test/json"; charset=UTF-8');
				if (this.medialist) {
					response.write(JSON.stringify(this.medialist));
					response.end();
				} else {
					this._readMediaDir(function(err, list) {
						if (!err) {
							this.medialist = [];
							list.forEach(function(file, index) {
								if (file) {
									this.medialist.push({id: index, name: file.substring(file.lastIndexOf('/')+1), url: file});
								}
							}.bind(this));
							response.write(JSON.stringify(this.medialist));
							response.end();
						}
					}.bind(this));
				}
			} else if (segments[0] === "playing") {
				response.setHeader('Content-Type', '"test/json"; charset=UTF-8');
				response.write(JSON.stringify(this.playing));
				response.end();
			} else if (segments[0] === "activity") {
				response.setHeader('Content-Type', '"test/json"; charset=UTF-8');
				response.write(JSON.stringify({activityId: this.playing.activityId}));
				response.end();
			}
		}
	},
	_handlePost: function(request, response, segments) {
		if (segments.length > 0) {
		}
		response.end();
	},
	_handlePut: function(request, response, segments) {
		if (segments.length > 1) {
			if (segments[0] === "playing") {
				var index = parseInt(segments[1]);
				var playEntry = {id: this.playlistIndex++, name: this.medialist[index].name, url: this.medialist[index].url};
				this.playing = playEntry;
				response.setHeader('Content-Type', '"test/json"; charset=UTF-8');
				response.write(JSON.stringify({}));
				response.end();
			} else if (segments[0] === "activity") {
				this.playing.activityId = segments[1];
				response.setHeader('Content-Type', '"test/json"; charset=UTF-8');
				response.write(JSON.stringify({}));
				response.end();
			}
		}
	},
	_handleDelete: function(request, response, segments) {
		if (segments.length > 0) {
			if (segments[0] === "activity") {
				this.playing.activityId = undefined;
				response.setHeader('Content-Type', '"test/json"; charset=UTF-8');
				response.write(JSON.stringify({}));
				response.end();
			}
		}
		response.end();
	},
	_handleHead: function(request, response, segments) {
		if (segments.length > 0) {
		}
	},
	_readMediaDir: function(cb) {
		var walkDir = function(dir, done) {
			var results = [];
		  	fs.readdir(dir, function(err, list) {
				if (err) return done(err);
				var pending = list.length;
				if (!pending) {
					console.log(results);
					return done(null, results);
				}
				list.forEach(function(file) {
			  		file = dir + '/' + file;
			  		fs.stat(file, function(err, stat) {
						if (stat && stat.isDirectory()) {
				  			walkDir(file, function(err, res) {
								results = results.concat(res);
								if (!--pending) {
									console.log(results);
									done(null, results);
								}
				  			});
						} else {
							if (addFile(file)) {
					  			results.push(file.substring(this.mediadir.length+1));
					  		}
				  			if (!--pending) {
								console.log(results);
				  				done(null, results);
				  			}
						}
			  		}.bind(this));
				}.bind(this));
		  	}.bind(this));
		}.bind(this);
		walkDir(this.mediadir, cb);
	}
};

function createHandler(downloadsdir) {
	return new RestHandler(downloadsdir);
}

exports = module.exports = createHandler;
