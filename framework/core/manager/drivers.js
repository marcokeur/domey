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

Drivers.prototype.loadDriver = function( thing, driverId ){
    var driver = require(__dirname + '/../../things/' + thing +   '/drivers/' + driverId + '/driver.js');
    driverList[driverId] = driver;
};

//eventEmitter.on('things.done', registerDrivers());
/*
function registerDrivers(){
    require('fs').readdirSync(__dirname + '/../../things/').forEach(function(thing) {
        console.log('Drivers - registering drivers for thing: ' + thing);
        
            var app_json = JSON.parse(require('fs').readFileSync(__dirname + '/../../things/' + thing + '/app.json', 'utf-8'));
            if(app_json.drivers !== undefined){
                app_json.drivers.forEach(function(driver){
                    console.log('Drivers - registering driver: ' +driver.id);   

                    var raw = require(__dirname + '/../../things/' + thing + '/drivers/' + driver.id + '/driver.js');
                    console.log(raw);
                    driverList[driver.id] = raw;
            
                });
            }

    });
}
*/