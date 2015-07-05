"use strict";
  
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Flow() 
{
	EventEmitter.call(this);
}

module.exports = Flow;

util.inherits(Flow, EventEmitter);

Flow.prototype.init = function(){
	console.log("flow init");
};