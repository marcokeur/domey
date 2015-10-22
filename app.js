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
    var args = {
            device: {
                data: {
                    id: '1'
                },
                driver: {
                    id: 'airplay'
                },
                args: {
                    file: __dirname + '/wakeup.mp3'
                }
            }
        }

    Domey.manager('flow').callItem('action', {method: 'play'}, args, function(res){
        console.log('event emitted: ' + res);
    });

}, 3000);

setTimeout(function () {
    var args = {
            device: {
                data: {
                    id: '1'
                },
                driver: {
                    id: 'airplay'
                },
                args: {
                    file: __dirname + '/wakeup.mp3'
                }
            }
        }

    Domey.manager('flow').callItem('action', {method: 'play'}, args, function(res){
        console.log('event emitted: ' + res);
    });

    var args = {
            device: {
                data: {
                    id: 1
                },
                driver: {
                    id: 'airplay'
                },
                args: {
                    file: __dirname + '/wakeup.mp3'
                }
            }
        }

    setTimeout(function(){
        Domey.manager('flow').callItem('action', {method: 'stop'}, args, function(res){
            console.log('stopped');
        });
    }, 5000);

}, 20000);

*/


