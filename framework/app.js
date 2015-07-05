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
});



