//https://wiki.pilight.org/doku.php/arctech_switch_old_v7_0?s[]=eurodomest
var request = require('request');

var self = {

    switches: [
        {   deviceId:     0,
            unit:         1,
            id:           2,
            enabled:  false
        },
        {   deviceId:     1,
            unit:         1,
            id:           2,
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

                //just for test:
                //Domey.capabilityUpdated('com.arc-tech', 'old', deviceId, 'enabled', device.enabled);

                callback(device.enabled);
            }
        }
    }
};

function sendSignal(address, device, group, enabled, callback){
    var kakuPeriodicity = 375;

    var trits = getTrits(address, device, group, enabled);
    console.log('trits: ' + trits);

    Domey.log(0, 0, 'Sending out: ' + JSON.stringify(trits));

    Domey.interface('wireless_433').send(trits, kakuPeriodicity, callback);
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

function deviceToTrits(device){}

/*
var code;
function createCode(unit, id, state){

    code = [];

    convertToPulses(unit, 5);

    convertToPulses(id, 5);

    addToCode(highPulse);

    convertToPulses(state);

    addToCode(endPulse);

    console.log(code);
}

function convertToPulses(number, length){
    var binary = dec2bin(number);
    console.log(binary);
    if((binary.length - length) < 0){
        for(var i = 0; i > (binary.length - length); i--){
            addToCode(lowPulse);
        }
    }

    for(var i = 0; i < binary.length; i++){
        if(binary[i] == 1){
            addToCode(lowPulse);
        }else{
            addToCode(highPulse);
        }
    }
}

function addToCode(pulse){
    pulse.forEach(function(value){
        code.push(value);
    });
}
*/
module.exports = self;
