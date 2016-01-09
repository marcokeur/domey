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

                sendSignal(null, enabled, function(result){
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

function sendSignal(channel, enabled, callback){
    var kakuPeriodicity = 375;
    var opts = {
        //startSig    : new Buffer([0]),        //arc tech old doesnt have a startsig
        highSig     : [ kakuPeriodicity, 3*kakuPeriodicity, 3*kakuPeriodicity, kakuPeriodicity],  //high third pulse, means 0
        lowSig      : [ kakuPeriodicity, 3*kakuPeriodicity, kakuPeriodicity, 3*kakuPeriodicity],  //low third pulse, means 1
        endSig      : [ kakuPeriodicity, 32*kakuPeriodicity],            //endsig of messages
        cycles      : [ 3 ]                    //repeats of whole message
    }

    if( enabled ){
        //10100 00001 0 0
        opts.mainSig = new Buffer([0xA0, 0x40, 0x00, 0x00, 12]);
    }else{
        //10100 00001 0 1
        opts.mainSig = new Buffer([0xA0, 0x50, 0x00, 0x00, 12]);
    }

    Domey.log(0, 0, 'Sending out: ' + JSON.stringify(opts));

    Domey.interface('wireless_433').send(opts, callback);
}

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
