var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mosca = require('mosca')
var fs = require('fs');

//interface config
var config;



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
    
    config = Domey.getConfig('interfaces', 'mqtt_server');
  
    var mongo = {
        type: 'mongo',
        url: config.mongo.url,
        pubsubCollection: config.mongo.collection,
        mongo: {}
    };

    var settings = {
        port: config.port,
        backend: mongo
    };

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
