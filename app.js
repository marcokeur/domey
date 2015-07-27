var winston = require('winston');
winston.add(winston.transports.File, {filename: 'debug.log'});

winston.info('framework starting');

var core = require('./core/core.js');
GLOBAL.Domey = new core();

Domey.init();

Domey.on('ready', function () {
    winston.info('initialization done!');
});

/*
setTimeout(function () {
    Domey.manager('flow').trigger('measurement', {'light': 200});
    console.log('trigger fired');
}, 3000);
*/