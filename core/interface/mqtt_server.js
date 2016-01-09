var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mosca = require('mosca')
var fs = require('fs');

//interface config
var config;
//holds all subscribed topics by things
var subscriptions = [];

var server;

function mqtt_server() 
{
    EventEmitter.call(this);
}

module.exports = mqtt_server;

util.inherits(mqtt_server, EventEmitter);


mqtt_server.prototype.getName = function(){
    return 'mqtt';   
}

mqtt_server.prototype.init = function(){
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

	server = new mosca.Server(settings);

	server.on('clientConnected', function(client) {
		Domey.log(4, 0, 'Client connected: ', client.id);
	});

	// fired when a message is received
	server.on('published', function(packet, client) {
        for(var i in subscriptions){
            if(subscriptions[i] == packet.topic){
                self.emit(packet.topic, packet.payload);
            }
        }
	});
}

mqtt_server.prototype.subscribe = function(topic){
    subscriptions.push(topic);
}

mqtt_server.prototype.publish = function(topic, payload, callback){
	var message = {
	  topic: topic,
	  payload: payload, // or a Buffer
	  qos: 0, // 0, 1, or 2
	  retain: false // or true
	};

	server.publish(message, function() {
        callback();
	});
}
