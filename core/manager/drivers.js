var winston = require('winston');

var driverList = {};

var util = require('util');
var EventEmitter = require('events').EventEmitter;


function Drivers() 
{
	EventEmitter.call(this);
}

module.exports = Drivers;

util.inherits(Drivers, EventEmitter);

Drivers.prototype.getName = function(){
    return 'drivers';   
}

Drivers.prototype.init = function(){
	//console.log("Drivers init");
    Domey.on('thing_registered', function(thing){
        thing.meta.drivers.forEach(function(driver){
            console.log('driver: ' + driver.id + ' thingname -> ' + thing.name);
            loadDriver(thing.name, driver.id, function(){
               Domey.manager('drivers').emit('driver_registered', driver); 
            });
        }); 
    });
};

Drivers.prototype.getDriver = function( id ){
    return driverList[id];
};

Drivers.prototype.getDrivers = function(){
    return driverList;
}

Drivers.prototype.realtime = function(msg){
    this.emit('realtime', msg);
    winston.info('Realtime event emitted', msg);
};

function loadDriver( thing, driverId, callback){
    var driver = require(__dirname + '/../../things/' + thing +   '/drivers/' + driverId + '/driver.js');
    driverList[driverId] = driver;
    driverList[driverId].init('devices...', function(){
        //callback when driver is loaded
        callback();
    });
};