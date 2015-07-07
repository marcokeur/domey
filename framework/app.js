var core = require('./core/core.js');
GLOBAL.Manager = new core();
//GLOBAL.Homey = new coreManager();

Manager.init();
Manager.log("starting");

//var thing = require('./things/nl.philips.hue/app.js');
//var Thing = thing();

//var thing = require('./things/com.thinkingcleaner/app.js');
//var Thing = new thing();
//Thing.init();

//console.log(Homey.manager('things').thing());
//Homey.manager('things').thing('com.thinkingcleaner').init();

/*
var args = {
    device : {
        driver : {
            id : 'tc'
        },
        data : {
            id : 123
        }
    }
};
args.device.driver.id = 'tc';
*/
Manager.on('ready', function(){
    console.log('initialization done!');
    
//    Homey.manager('flow').emit('condition.cleaning', args, function(state){
//        console.log("CALLBACK!!! " + state);
//    });
    var devices;
    console.log(Manager.manager('drivers').getDriver('bulb').init(devices, function(){
        console.log("done");
        
        var device = Manager.manager('drivers').getDriver('bulb').getDevice(1);
        console.log('device: ' + device.id);
        Manager.manager('drivers').getDriver('bulb').capabilities.onoff.set(device, true, function(state){
               console.log('device state set: ' + state);
        });
    }));
    
    
    console.log(Manager.manager('drivers').getDriver('roomnode').init(devices, function(){
        console.log("done");
        
        
    }));    
    
});



