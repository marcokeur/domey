var thingList = {};

var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var validate = require('jsonschema').validate;
var self;

function Things()
{
    EventEmitter.call(this);
}

module.exports = Things;

util.inherits(Things, EventEmitter);

Things.prototype.getName = function(){
    return 'things';
}

Things.prototype.init = function(){
    self = this;

    var thingNames = getThingNames();

    self.on('thingRegistered', function(thingName){
        //check if all items have been loaded
        if(Object.keys(thingList).length == fs.readdirSync(__dirname + '/../../things/').length) {
            setTimeout(function(){
                //if so, emit the all things registered event
                self.emit('allThingsRegistered');
                console.log('all things registered!');
            }, 2000);
        }
    });

    Domey.manager('web').addApiCall('GET', 'thing', this.apiGetCollection, this.apiGetElement, this.apiGetRouter);
    Domey.manager('web').addApiCall('POST', 'thing', null, null, this.apiPostRouter);

    for(var i in thingNames){
        Domey.log(2, 0, 'loading ' + thingNames[i]);
        loadThing(this, thingNames[i]);
    }
};

Things.prototype.apiGetCollection = function(cb, handler){
    var response = [];

    //set http response code
    response['status'] = 200;
    response['data'] = { 'things' : []};

    for(var i in thingList){
        response['data'].things.push({ 'name' : i,
                            'drivers' : gatherCapabilties(self, i)
                            });
    }
    cb(response, handler);
};

Things.prototype.apiGetElement = function(thingName, cb, handler){
    var response = [];

    //set http response code
    response['status'] = 404;
    response['data'];

    for(var i in thingList){
        if(i == thingName){
            response['status'] = 200;
            response['data'] = { 'thing' : { 'name' : i,
                'drivers' : gatherCapabilties(self, i)
            }};

            break;
        }
    }
    cb(response,handler);
};

Things.prototype.apiGetRouter = function(params, callback, handler){
    var response = [];
    var thingName = params[1];
    var driverName = params[2];
    var deviceId = params[3];
    var capabilityName = params[4];

    response['status'] = 404;

    var driver = Domey.manager('drivers').getDriver(thingName, driverName);

    if(driver == undefined){
        callback(response, handler);

        return;
    }

    if(capabilityName != undefined){
        driver.capabilities[capabilityName].get(deviceId, function(retVal){
            response['status'] = 200;
            response['data'] = JSON.parse(JSON.stringify({ 'thing' : {
                'name' : thingName,
                'driver' : {
                    'name' : driverName,
                    'deviceId' : deviceId,
                    'capability' : {
                        'name' : capabilityName, 'value' : retVal
                    }
                }
            }
            }));
            callback(response, handler);
        });
    }

};

Things.prototype.apiPostRouter = function(params, body, callback, handler){
    var response = [];
    var thingName = params[1];
    var driverName = params[2];
    var deviceId = params[3];

    var driver = Domey.manager('drivers').getDriver(thingName, driverName);
    var metaData = Domey.manager('drivers').getSchema(thingName, driverName);

    response['status'] = 200;
    response['data'] = JSON.parse(JSON.stringify({ 'thing' : {
                           'name' : thingName,
                           'driver' : {
                               'name' : driverName,
                               'deviceId' : deviceId,
                               'capabilities' : []
                           }
                       }
                       }));

    for(var i in body){
        if(typeof driver.capabilities[i] == 'undefined'){
            response['status'] = 400;
            response['data'].thing.driver.capabilities.push({'name' : i, 'error': 'unknown capability'});
        }else{
            console.log('meta' + JSON.stringify(metaData.capabilities));
            var schema;
            for(var j in metaData.capabilities){
                schema = metaData.capabilities[j].set;
            }

            var validationResult = validate(body, schema);

            if(validationResult.errors.length == 0){
                if(typeof driver.capabilities[i].set != 'undefined'){
                    driver.capabilities[i].set(deviceId, body[i], function(retVal){
                        if(retVal == body[i]){
                            response['data'].thing.driver.capabilities.push({'name' : i, 'value': body[i]});
                        }else{
                            response['data'].thing.driver.capabilities.push({'name' : i, 'error': 'setting ' + i + ' to ' + body[i] + ' failed'});
                        }
                    });
                }else{
                    response['status'] = 400;
                    response['data'].thing.driver.capabilities.push({'name' : i, 'error': 'capability not settable'});
                }
            }else{
                //an error occurred validation the post data
                response['status'] = 400;
                response['data'].thing.driver.capabilities.push({'name' : i, 'error': validationResult.errors[0].stack});
            }
        }
    }

    callback(response, handler);
};

function getThingsDir(){
    return __dirname +'/../../things/';
}

function getThingNames(){
    return fs.readdirSync(getThingsDir());
}

function getThingDir(thingName){
    return getThingsDir() + thingName + '/';
}

function isThingInstalled(thingName){
    return fs.existsSync(getThingDir(thingName) + '.installed');
}

function markThingInstalled(thingName){
    fs.closeSync(fs.openSync(getThingDir(thingName) + '.installed', 'w'));
}

function installDependencies( dependencies, callback ){
    var depList = [];
    for(var dep in dependencies){
        depList.push(dep + "@" + dependencies[dep]);
    }

    var npm = require("npm");
    npm.load(function (err) {
        // catch errors
        npm.commands.install(depList, function (er, data) {
            // log the error or data
            callback();
        });
    });
}

Things.prototype.getThingMetaData = function(thingName, part){
    var meta = JSON.parse(fs.readFileSync(getThingDir(thingName) + 'app.json'));

    if(part !== undefined){
        meta = meta[part];
    }

    return meta;
}

function prepareThing(self, thingName, callback){
    var metaData = self.getThingMetaData(thingName);

    if(!isThingInstalled(thingName)){
        installDependencies(metaData.dependencies, callback);
        //mark as installed
        markThingInstalled(thingName);
    }else{
        callback();
    }
}

function loadThing(self, thingName){
    prepareThing(self, thingName, function(){
        //instantiate the thing
        var obj = require(getThingDir(thingName) + 'app.js');

        var inst = new obj();
        //call init on thing
        inst.init();

        thingList[thingName] = inst;

        self.emit('thingRegistered', thingName);
        Domey.log(2, 0, 'Thing ' + thingName + ' registered');
    });

}

function gatherCapabilties(self, thingName){
    var response = [];
    var metaData = self.getThingMetaData(thingName, 'drivers');

    for(var i in metaData){
        response.push({
            'name': metaData[i].id,
            'capabilities': metaData[i].capabilities,
            'devices': getDeviceIdList(thingName, metaData[i].id)
        });
    }

    return response;
}

function getDeviceIdList(thingName, driverName){
    var driver = Domey.manager('drivers').getDriver(thingName, driverName);
    return driver.getDeviceIdList();

}