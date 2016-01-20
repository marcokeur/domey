var request = require('request');
var settings = Domey.manager('things').getThingMetaData('nl.precision-it.p1', 'settings');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort
var serial = null;

var self = {

    cache: {},

    init: function( devices, callback ){

        var self = this;
        console.log('driver p1 init');

        serial = new SerialPort(settings.port, {
            baudrate: 9600,
            databits: 7,
            parity: "even",
            stopbits: 1,
            xon: 0,
            xoff: 0,
            rtscts: 0,
            parser: serialport.parsers.readline("!")
        }, false);

        serial.on('data', function(msg) {
            console.log(msg);
            parsePackage(msg);
        });

        // we're ready
        callback();
    },

    getDeviceIdList: function() {
        var deviceIdList = [ 'system' ];

        return deviceIdList;
    },

    capabilities: {
        t1Used: {
            get: function(deviceId, callback){
                callback(self.cache.t1Used);
            }
        },
        t2Used: {
            get: function(deviceId, callback){
                callback(self.cache.t2Used);
            }
        },
        t1Returned: {
            get: function(deviceId, callback){
                callback(self.cache.t1Returned);
            }
        },
        t2Returned: {
            get: function(deviceId, callback){
                callback(self.cache.t2Returned);
            }
        },
        currentTarif: {
            get: function(deviceId, callback){
                callback(self.cache.currentTarif);
            }
        },
        currentlyUsing: {
            get: function(deviceId, callback){
                callback(self.cache.currentlyUsing);
            }
        },
        currentlyReturning: {
            get: function(deviceId, callback){
                callback(self.cache.currentlyReturning);
            }
        },
        gasUsed: {
            get: function (deviceId, callback) {
                callback(self.cache.gasUsed);
            }
        }
    }
};

function updateCache(key, value){
    self.cache[key] = value;
    Domey.capabilityUpdated('nl.precision-it.p1', 'p1', 'system', key, value);
}

function parsePackage(rawData) {
     var lines = rawData.split("\r\n");
     // Not a full package (not enough lines)
     if(lines.length < 19) {
         return null;
     }

     for(var l = 0; l < lines.length; l++) {
         var regex = /\d\-\d:(\d+\.\d+\.\d+)\(([\d\.]*)\*?(.*)?\)/g;
         var res = regex.exec(lines[l]);
         if(!res) continue;

         switch(res[1]) {
             case '1.8.1':
                 updateCache("t1Used",  parseFloat(res[2]));
                 break;
             case '1.8.2':
                 updateCache("t2Used" ,parseFloat(res[2]));
                 break;
             case '2.8.1':
                 updateCache("t1Returned",  parseFloat(res[2]));
                 break;
             case '2.8.2':
                 updateCache("t2Returned",  parseFloat(res[2]));
                 break;
             case '96.14.0':
                 updateCache("currentTarif",  parseFloat(res[2]));
                 break;
             case '1.7.0':
                 updateCache("currentlyUsing", parseInt(res[2].replace('.', '') + '0'));
                 break;
             case '2.7.0':
                 updateCache("currentlyReturning", parseInt(res[2].replace('.', '') + '0'));
                 break;
             case '24.3.0':
                 updateCache("gasUsed", lines[l+1].replace(/[\(\)]/g, '').trim());
                 break;
         }
     }

     //return data;
 }


module.exports = self;
