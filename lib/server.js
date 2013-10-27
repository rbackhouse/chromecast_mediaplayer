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

var http = require('http');
var fs = require('fs');
var connect = require('connect');
var zazloptimizer = require('zazloptimizer');
var resthandler = require("./resthandler");

var defaultPort = process.env.npm_package_config_port || 8080;
var resourcecdir = fs.realpathSync(__dirname+"/../resources");
var port = process.argv.length > 2 ? parseInt(process.argv[2]) : defaultPort;
var mediaPath = process.argv.length > 3 ? process.argv[3] : "./downloads";
var mediadir = fs.realpathSync(mediaPath);

var optimizer = zazloptimizer.createConnectOptimizer(resourcecdir, false);
var resthandler = resthandler(mediadir);
var app = connect()
	.use("/_javascript", optimizer)
	.use("/rest", resthandler)
	.use(connect.static(resourcecdir))
	.use(connect.static(mediadir))
	.use(connect.static(zazloptimizer.getLoaderDir()));

var server = http.createServer(app).listen(port);

console.log("Chromecast Media Player available on HTTP port ["+port+"] media directory ["+mediadir+"]");