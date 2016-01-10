var mongoose = require('mongoose');
var db = mongoose.connection;

var CapabilityEvent = new mongoose.Schema({
    driverName : String,
    capabilityName :String,
    deviceId :String,
    value:String,
    when: { type: Date, default: Date.now}
});
/*
var Capability = new mongoose.Schema({
    name :String,
    deviceId :String,
    events: [CapabilityEvent]
});

var Driver = new mongoose.Schema({
    name : String,
    capabilities:[Capability],
    events: []
});
*/
var Thing = new mongoose.Schema({
    name : String,
    //drivers: [Driver],
    capabilityEvent: [CapabilityEvent]
});

var self;

    
function Persistence() 
{
	
}

module.exports = Persistence;

Persistence.prototype.getName = function(){
    return 'persistence';
};

Persistence.prototype.init = function(){
	self = this;
/*
    mongoose.connect('mongodb://localhost/domotica');
    
    var mongoHandle = mongoose.model('CapabilityUpdates', Thing);

    Domey.on('capabilityUpdated', function(data){
        //console.log('Make persistent: ' + JSON.stringify(data));

        var event = {
            driverName: data.thing.driver.name,
            capabilityName: data.thing.driver.capability.name,
            deviceId: data.thing.driver.deviceId,
            value: data.thing.driver.capability.value
        };

        mongoHandle.findOneAndUpdate(
        {
            name: data.thing.name,
        },
        {
            $push: {capabilityEvent: event}
        },
        {
            safe:true,
            upsert: true
        }, function(err, doc){
            if(err)
                Domey.log(3, 0, 'Mongodb upsert error: ' + err + ' ');
        });
    });
*/
    Domey.manager('web').addApiCall('GET', 'persistence', this.apiGetCollection, this.apiGetElement, this.apiGetRouter);
};
Persistence.prototype.apiGetCollection = function(callback, handler){

    self.apiGetRouter(params, callback, handler);
}

Persistence.prototype.apiGetElement = function(element, callback, handler){
    var params = [];
    params[1] = element;

    self.apiGetRouter(params, callback, handler);
}

Persistence.prototype.apiGetRouter = function(params, callback, handler){
    var response = [];
    var thingName = params[1];
    var driverName = params[2];
    var deviceId = params[3];
    var capabilityName = params[4];

    response['status'] = 404;

    var matchRules = [];

    if(typeof driverName != 'undefined')
        matchRules.push({'capabilityEvent.driverName': driverName});

    if(typeof deviceId != 'undefined')
        matchRules.push({'capabilityEvent.deviceId': deviceId});

    if(typeof capabilityName != 'undefined')
        matchRules.push({'capabilityEvent.capabilityName': capabilityName});

    var mongoHandle = mongoose.model('CapabilityUpdates', Thing);

    mongoHandle.aggregate([
        {$match: {'name': thingName}},
        {$unwind: '$capabilityEvent'},
        {$match: {
            $and: matchRules
        }}
    ],function(err, res){
        response['status'] = 200;
        response['data'] = res;
        callback(response, handler);
    });
};

