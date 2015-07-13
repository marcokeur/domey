"use strict";
var driverList = {};

var util = require('util');
var EventEmitter = require('events').EventEmitter;


function Drivers() 
{
	EventEmitter.call(this);
}

module.exports = Drivers;

util.inherits(Drivers, EventEmitter);

Drivers.prototype.init = function(){
	console.log("Drivers init");
};

Drivers.prototype.getDriver = function( id ){
    return driverList[id];
};

Drivers.prototype.loadDriver = function( thing, driverId, callback){
    var driver = require(__dirname + '/../../things/' + thing +   '/drivers/' + driverId + '/driver.js');
    driverList[driverId] = driver;
    driverList[driverId].init('bla', function(){
        console.log('driver init done');
    });
    console.log(util.inspect(driverList, {showHidden: false, depth: null}));

    callback();
};

Drivers.prototype.realtime = function(msg){
    console.log('realtime event! -> ' + JSON.stringify(msg));
    var util = require('util');

    this.emit('realtime', msg);
};