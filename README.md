## chromecast_mediaplayer

A simple Chromecast Media player that plays media from the filesystem. The frontend is Web Based assuming that the Chrome Browser is Chromecast enabled.

## Install

You must first get your Chromecast device whitelisted. See https://developers.google.com/cast/whitelisting#whitelist-receiver.

You must also ensure that the domain you are running the sender web application on is added to the Chrome Browsers configuration. 
See the "Whitelisting Chrome apps" section on https://developers.google.com/cast/whitelisting.

## Setup

Grab a copy of the sender web application

git clone https://github.com/rbackhouse/chromecast_mediaplayer.git

Set your app id in resources/chromecast/receiver.html and make sure your receiver URL is loading this.
Set your app id in resources/js/chromecast.js.

## Running the sender application

node lib/server.js [port] [path to media]

Point a Chromecast enabled Chrome Browser at http://host:port