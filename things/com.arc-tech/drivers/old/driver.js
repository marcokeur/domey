//https://wiki.pilight.org/doku.php/arctech_switch_old_v7_0?s[]=eurodomest
var request = require('request');

var self = {

    switches: [
        {   deviceId:     0,
            unit:         1,
            id:           1,
            enabled:  false,
        },
        {   deviceId:     1,
            unit:         1,
            id:           1,
            enabled:  false,
        }
    ],

    init: function( devices, callback ){

        var self = this;
        console.log('driver kaku old init');

        // we're ready
        callback();
    },

    getDeviceIdList: function() {
        var deviceIdList = [ ];

        for(var i in self.switches){
            deviceIdList.push(self.switches[i].deviceId);
        }

        return deviceIdList;
    },

    getDevice: function(deviceId){
        for(var i in self.switches){
            if(self.switches[i].deviceId == deviceId){
                return self.switches[i];
            }
        }
    },

    capabilities: {
        enabled: {
            get: function( deviceId, callback ){
                var device = self.getDevice( deviceId );

                if( device instanceof Error ) return callback( device );

                callback(device.enabled);
            },

            set: function( deviceId, enabled, callback ){
                var device = self.getDevice( deviceId );

                if( device instanceof Error ) return callback( device );

                sendSignal(null, enabled, function(result){
                    if(result){
                        device.enabled = enabled;
                        Domey.capabilityUpdated('com.arc-tech', 'old', deviceId, 'enabled', device.enabled);
                    }
                });

                //just for test:
                //Domey.capabilityUpdated('com.arc-tech', 'old', deviceId, 'enabled', device.enabled);

                callback(device.enabled);
            }
        }
    }
};

function sendSignal(channel, enabled, callback){
    var opts = {
        cycles      : new Buffer([ 3 ]),
        mainSig     : new Buffer([ 335, 1005, 1005,  335,       //0
                                   335, 1005,  335, 1005,       //1
                                   335, 1005,  335, 1005,       //1
                                   335, 1005,  335, 1005,       //1
                                   335, 1005, 1005,  335,       //0
                                   335, 1005,  335, 1005,       //1
                                   335, 1005,  335, 1005,       //1
                                   335, 1005,  335, 1005,       //1
                                   335, 1005,  335, 1005,       //1
                                   335, 1005, 1005,  335,       //0
                                   335, 1005, 1005,  335,       //0
                                   335, 1005, 1005,  335,       //0
                                   335, 11390 ]),
    }

    Domey.interface('wireless_433').send(opts, callback);
}

module.exports = self;
