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
    Domey.manager('things').on('thingRegistered', function(thingName){
        var metaData = Domey.manager('things').getThingMetaData(thingName);

        metaData.drivers.forEach(function(driver){
            loadDriver(thingName, driver.id, function(){
               Domey.manager('drivers').emit('driver_registered', driver);
            });
        }); 
    });
};

Drivers.prototype.getDriver = function(thingName, driverName){
    if(typeof driverName === 'undefined'){
        return driverList[thingName];
    }else{
        return driverList[thingName + '.' + driverName];
    }
};

Drivers.prototype.realtime = function(msg){
    this.emit('realtime', msg);
};

function loadDriver(thing, driverId, callback){
    var driver = require(__dirname + '/../../things/' + thing +   '/drivers/' + driverId + '/driver.js');
    driverList[thing + '.' + driverId] = driver;
    driverList[thing + '.' + driverId].init('devices...', function(){
        //callback when driver is loaded
        callback();
    });
};