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
    var driver = Domey.manager('drivers').getDriver('airplay');

    driver.capabilities.play.set(null, __dirname + '/public/airplay/wakeup.mp3', function(res){
        console.log(res);
        setTimeout(function(){driver.capabilities.stop.set(null, null)}, 4000);
    });

    setInterval(function(){
        driver.capabilities.play.set(null, __dirname + '/public/airplay/wakeup.mp3', function(res){
            console.log(res);
            setTimeout(function(){driver.capabilities.stop.set(null, null)}, 4000);
        }
    );
    }, 6000);
}, 3000);
