//https://wiki.pilight.org/doku.php/arctech_switch_old_v7_0?s[]=eurodomest
var request = require('request');

var self = {

    switches: [
        {   deviceId:     0,
            unit:         3,
            id:           0,
            enabled:  false
        },
        {   deviceId:     1,
            unit:         3,
            id:           1,
            enabled:  false
        }
    ],

    init: function( devices, callback ){

        self = this;
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

                sendSignal(device.unit, device.id, 0, enabled, function(result){
                    if(result){
                        device.enabled = enabled;
                        Domey.capabilityUpdated('com.arc-tech', 'switch', deviceId, 'enabled', device.enabled);
                    }
                });

                callback(device.enabled);
            }
        }
    }
};

function sendSignal(address, device, group, enabled, callback){
    var kakuPeriodicity = 375;
    var repeats = 5;

    var trits = getTrits(address, device, group, enabled);

    Domey.log(0, 0, 'Sending out: ' + JSON.stringify(trits));

    Domey.interface('ook_433').send(trits, kakuPeriodicity, repeats, callback);
}


function getTrits(address, device, group, enabled){
    var trits = [];
    var i;

    for(i = 0; i < 4; i++){
        trits[i]=(address & 1)?2:0;
        address>>=1;

    }

    for(; i<6; i++){
        trits[i] = (device & 1)?2:0;
        device>>1;
    }

    for(; i<8; i++){
        trits[i]= (group & 1)?2:0;
        group>>=1;
    }

    trits[8] = 0;
    trits[9] = 2;
    trits[10] = 2;

    //on or off
    trits[11]=(enabled?2:0);

    return trits;
}

module.exports = self;
