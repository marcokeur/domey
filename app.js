var winston = require('winston');
winston.add(winston.transports.File, {filename: 'debug.log'});

winston.info('framework starting');

var core = require('./core/core.js');
GLOBAL.Domey = new core();

Domey.init();

Domey.on('ready', function () {
    winston.info('initialization done!');
});


setTimeout(function () {
    var ip;
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        ip = add;
        console.log('addr: '+add);
    });

    var device = Domey.manager('drivers').getDriver('airplay').getDevice(0);
    console.log((device));
    if(device instanceof Error){

    }else{
        Domey.manager('drivers').getDriver('airplay').capabilities.play.set(device, 'http://' + ip +'/airplay/wakeup.mp3', function(response){
            console.log('airplay response: ' + response);
        });
    }
}, 3000);
