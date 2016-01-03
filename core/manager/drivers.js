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
    console.log("driver mamanger - init");

    Domey.on('thing_registered', function(thingName){
        console.log('thingdriver ' + thingName);

        var metaData = Domey.manager('things').getThingMetaData(thingName);

        metaData.drivers.forEach(function(driver){
            loadDriver(thingName, driver.id, function(){
               Domey.manager('drivers').emit('driver_registered', driver); 
            });
        }); 
    });
};

Drivers.prototype.getDriver = function( id ){
    return driverList[id];
};

Drivers.prototype.getDriver = function(thingName, driverName){
    return driverList[thingName + '.' + driverName];
};

Drivers.prototype.realtime = function(msg){
    this.emit('realtime', msg);
};

function loadDriver( thing, driverId, callback){
    var driver = require(__dirname + '/../../things/' + thing +   '/drivers/' + driverId + '/driver.js');
    driverList[thing + '.' + driverId] = driver;
    driverList[thing + '.' + driverId].init('devices...', function(){
        //callback when driver is loaded
        callback();
    });
};