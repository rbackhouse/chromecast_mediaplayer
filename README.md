## chromecast_mediaplayer

A simple Chromecast Media player that plays media from the filesystem. The frontend is Web Based assuming that the Chrome Browser is Chromecast enabled.

## Install

You must first get your Chromecast device registered. See https://developers.google.com/cast/docs/registration.
This sender application uses the Default Media Receiver (https://developers.google.com/cast/docs/receiver_apps#default) so only 
the device needs to be registered.

## Setup

Grab a copy of the sender web application

git clone https://github.com/rbackhouse/chromecast_mediaplayer.git

cd chromecast_mediaplayer

npm install

## Running the sender application

node lib/server.js [port] [path to media]

Point a Chromecast enabled Chrome Browser at http://host:port