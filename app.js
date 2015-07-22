var winston = require('winston');
winston.add(winston.transports.File, { filename: 'debug.log' });

winston.info('framework starting');

var core = require('./core/core.js');
GLOBAL.Domey = new core();

Domey.init();

Domey.on('ready', function(){
    winston.info('initialization done!');
    
    var devices;
    console.log(Domey.manager('drivers').getDriver('bulb').init(devices, function(){
        //console.log("done");
        
        //var device = Manager.manager('drivers').getDriver('bulb').getDevice(1);
        //console.log('device: ' + device.id);
        //Manager.manager('drivers').getDriver('bulb').capabilities.onoff.set(device, true, function(state){
               //console.log('device state set: ' + state);
        //});
        winston.verbose('bulb driver initialized');
    }));
    
    
    console.log(Domey.manager('drivers').getDriver('roomnode').init(devices, function(){
        //console.log("done");
        winston.verbose('roomnode driver initialized');
        
    }));    
    
                

   
});


            setTimeout(function() {
                Domey.manager('flow').trigger('measurement', { 'light': 200 });
                console.log('trigger fired');
            }, 3000);
