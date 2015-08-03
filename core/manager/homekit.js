var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var crypto = require('crypto');
var storage = require('node-persist');

function HomeKit() {
	EventEmitter.call(this);
}

module.exports = HomeKit;

util.inherits(HomeKit, EventEmitter);

// Initialize persistent storage
storage.initSync();

HomeKit.prototype.getName = function(){
    return 'homekit';
}

HomeKit.prototype.init = function () {
	console.log("homekit mamanger - init");

    self = this;



    Domey.on('all_things_registered', function(things){
        var drivers = Domey.manager('drivers').getDrivers();

        for(var driverName in drivers){

            //if(driver.getClass() == 'light'){
            if(driverName == 'bulb'){           //nasty ass hack, should look at class and capabilities of driver
                for(var j in drivers[driverName].devices){
                    registerHomekitAccessory(driverName, drivers[driverName].devices[j], function(accessoryName){
                        console.log("Registered " + accessoryName + " accessory...");
                    });
                }
            }
        }
    });
};

function registerHomekitAccessory(driverName, device, callback){
        var accessoryConfig = {
            "name" : driverName + "_" + device.name,
            "id" : device.id,
            "type" : device.type
        };

        var accessoryName = accessoryConfig['name'];
        var accessoryModule = require(__dirname + '/homekit/milight_accessory.js');
        var accessoryConstructor = accessoryModule.accessory;


        var accessory = new accessoryConstructor(accessoryConfig);

        // Extract the raw "services" for this accessory which is a big array of objects describing the various
        // hooks in and out of HomeKit for the HAP-NodeJS server.
        var services = accessory.getServices();
        createHAPServer(accessory.name, services, accessory.transportCategory);

        callback(accessoryName);
}


//STUFF BENEED IS FROM "homebridge" PROJECT

//
// Creates the actual HAP servers which listen on different sockets
//

// Pull in required HAP-NodeJS stuff
var accessory_Factor = new require("HAP-NodeJS/Accessory.js");
var accessoryController_Factor = new require("HAP-NodeJS/AccessoryController.js");
var service_Factor = new require("HAP-NodeJS/Service.js");
var characteristic_Factor = new require("HAP-NodeJS/Characteristic.js");

// Each accessory has its own little server. We'll need to allocate some ports for these servers
var nextPort = 51826;
var nextServer = 0;
var accessoryServers = [];
var accessoryControllers = [];
var usernames = {};

function createHAPServer(name, services, transportCategory) {
    var accessoryController = new accessoryController_Factor.AccessoryController();

    //loop through services
    for (var j = 0; j < services.length; j++) {
        var service = new service_Factor.Service(services[j].sType);

        //loop through characteristics
        for (var k = 0; k < services[j].characteristics.length; k++) {
            var options = {
                onRead: services[j].characteristics[k].onRead,
                onRegister: services[j].characteristics[k].onRegister,
                type: services[j].characteristics[k].cType,
                perms: services[j].characteristics[k].perms,
                format: services[j].characteristics[k].format,
                initialValue: services[j].characteristics[k].initialValue,
                supportEvents: services[j].characteristics[k].supportEvents,
                supportBonjour: services[j].characteristics[k].supportBonjour,
                manfDescription: services[j].characteristics[k].manfDescription,
                designedMaxLength: services[j].characteristics[k].designedMaxLength,
                designedMinValue: services[j].characteristics[k].designedMinValue,
                designedMaxValue: services[j].characteristics[k].designedMaxValue,
                designedMinStep: services[j].characteristics[k].designedMinStep,
                unit: services[j].characteristics[k].unit
            };

            var characteristic = new characteristic_Factor.Characteristic(options, services[j].characteristics[k].onUpdate);

            service.addCharacteristic(characteristic);
        }
        accessoryController.addService(service);
    }

    // create a unique "username" for this accessory based on the default display name
    var username = createUsername(name);

    if (usernames[username]) {
        console.log("Cannot create another accessory with the same name '" + name + "'. The 'name' property must be unique for each accessory.");
        return;
    }

    // remember that we used this name already
    usernames[username] = name;

    // increment ports for each accessory
    nextPort = nextPort + (nextServer*2);

    // hardcode the PIN to something random (same PIN as HAP-NodeJS sample accessories)
    var pincode = "031-45-154";

    var accessory = new accessory_Factor.Accessory(name, username, storage, parseInt(nextPort), pincode, accessoryController, transportCategory);
    accessoryServers[nextServer] = accessory;
    accessoryControllers[nextServer] = accessoryController;
    accessory.publishAccessory();

    nextServer++;
}

// Creates a unique "username" for HomeKit from a hash of the given string
function createUsername(str) {

    // Hash str into something like "098F6BCD4621D373CADE4E832627B4F6"
    var hash = crypto.createHash('md5').update(str).digest("hex").toUpperCase();

    // Turn it into a MAC-address-looking "username" for HomeKit
    return hash[0] + hash[1] + ":" +
           hash[2] + hash[3] + ":" +
           hash[4] + hash[5] + ":" +
           hash[6] + hash[7] + ":" +
           hash[8] + hash[9] + ":" +
           hash[10] + hash[11];
}

//startup();