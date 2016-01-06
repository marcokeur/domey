//https://wiki.pilight.org/doku.php/arctech_switch_old_v7_0?s[]=eurodomest
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
        console.log('driver dimmer kaku old init');

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
                        Domey.capabilityUpdated('com.arc-tech', 'dimmer', deviceId, 'enabled', device.enabled);
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
        //startSig    : new Buffer([0]),        //arc tech old doesnt have a startsig
        highSig     : [ 295, 1180, 1180, 295],  //high third pulse, means 0
        lowSig      : [ 295, 1180, 295, 1180],  //low third pulse, means 1
        endSig      : [ 295, 11210],            //endsig of messages
        cycles      : [ 20 ]                    //repeats of whole message
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

module.exports = self;
