var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mosca = require('mosca')
var fs = require('fs');

//interface config
var config;

var ascoltatore = {
  //using ascoltatore
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
};

var settings = {
  port: 1883,
  backend: ascoltatore
};

function mqtt_server() 
{
    EventEmitter.call(this);
}

module.exports = mqtt_server;

util.inherits(mqtt_server, EventEmitter);


mqtt_server.prototype.getName = function(){
    return 'mqtt_server';   
}

mqtt_server.prototype.init = function(){
	console.log("mqtt_server init");
    
    var self = this;


	var server = new mosca.Server(settings);

	server.on('clientConnected', function(client) {
		console.log('client connected', client.id);
	});

	// fired when a message is received
	server.on('published', function(packet, client) {
	  console.log('Published', packet.payload);
	});

	server.on('ready', setup);

	// fired when the mqtt server is ready
	function setup() {
	  console.log('Mosca server is up and running');
	}
}

mqtt_server.prototype.publish = function(topic, payload, retain){
	var message = {
	  topic: topic,
	  payload: payload, // or a Buffer
	  qos: 0, // 0, 1, or 2
	  retain: false // or true
	};

	server.publish(message, function() {
	  console.log('done!');
	});
}
