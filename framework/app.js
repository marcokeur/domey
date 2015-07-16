var winston = require('winston');
winston.add(winston.transports.File, { filename: 'debug.log' });

winston.info('framework starting');

var core = require('./core/core.js');
GLOBAL.Manager = new core();

Manager.init();

Manager.on('ready', function(){
    winston.info('initialization done!');
    
    var devices;
    console.log(Manager.manager('drivers').getDriver('bulb').init(devices, function(){
        //console.log("done");
        
        //var device = Manager.manager('drivers').getDriver('bulb').getDevice(1);
        //console.log('device: ' + device.id);
        //Manager.manager('drivers').getDriver('bulb').capabilities.onoff.set(device, true, function(state){
               //console.log('device state set: ' + state);
        //});
        winston.verbose('bulb driver initialized');
    }));
    
    
    console.log(Manager.manager('drivers').getDriver('roomnode').init(devices, function(){
        //console.log("done");
        winston.verbose('roomnode driver initialized');
        
    }));    
    
});



