var dgram       = require('dgram');
var client;

var self = {
    
    //holds all known devices
    devices: [
        {   id:     0,
            name:   'group1',
            on:     0x45,
            off:    0x46,
            state: {
                onoff:  'off'
            }
        },
        {   id:     1,
            name:   'group2',
            on:     0x47,
            off:    0x48,
            state: {
                onoff: 'off'
            }
        }
    ],

    init: function( devices, callback ) {
        
        client = dgram.createSocket('udp4');

        client.bind(8899, "255.255.255.255");
        client.on("listening", function () {
            client.setBroadcast(true);
            var address = client.address();
            console.log('UDP Server listening on ' + address.address + ":" + address.port);
        });

        client.on('message', function (message, remote) {
            var rxMsg = Array();

            rxMsg.push(message[0]);
            rxMsg.push(message[1]);
            rxMsg.push(message[2]);

            for(var deviceId in self.devices){
                if(rxMsg[0] == self.devices[deviceId].on){
                    console.log('Turning device ' + self.devices[deviceId].name + ' on');
                    
                    self.capabilities.enabled.set( deviceId, true, function(){
                        // emit realtime event if something has changed
                        Domey.manager('drivers').realtime({
                            thing: 'com.milight',
                            driver: 'roomnode',
                            device: deviceId,
                            state: {
                                type: 'onoff',
                                value: self.devices[deviceId].state.onoff
                            }   
                        });
                    });
                }else if(rxMsg[0] == self.devices[deviceId].off){
                    console.log('Turning device ' + self.devices[deviceId].name + ' off');
                    
                    self.capabilities.enabled.set( deviceId, false, function(){                    
                        // emit realtime event if something has changed
                        Domey.manager('drivers').realtime({
                            thing: 'com.milight',
                            driver: 'roomnode',
                            device: deviceId,
                            state: {
                                type: 'onoff',
                                value: self.devices[deviceId].state.onoff
                            }   
                        });
                    });
                }
            }
        });
        
        callback();
    },

	getDevice: function( id ) {
		if( typeof this.devices[id] == 'undefined' ) return new Error("device is not connected (yet)");
		return this.devices[id];
	},
    
    getStatus: function( device ) {
        return device;
    },
    
    update: function( id ) {
        var device = self.getDevice( id );
        var message = [];
        if ( device.state.onoff == 'on') {
            message.push(device.on);
        }else{
            message.push(device.off);
        }
        
        message.push(0x00);
        message.push(0x55);
        
        var buf = new Buffer(message);
        
        console.log(buf.toString('hex'));
        client.send(buf, 0, buf.length, 8899, '255.255.255.255', function(err, bytes){
            console.log('data send');
        });
    },

    capabilities: {

        enabled: {
            get: function( device, callback ) {
                var device = self.getDevice( device.id );
                console.log('device:' + device);
                if( device instanceof Error ) return callback( device );
                
                if(device.state.onoff == 'on'){
                    callback( true );
                }else{
                    callback( false );
                }
            },
            set: function( device, onoff, callback ) {
		console.log(device);
		console.log(onoff);
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );
		console.log(device);
                if(onoff){
                    device.state.onoff = 'on';
                }else{
                    device.state.onoff = 'off';
                }
                self.update( device.id );

                callback( device.state.onoff );
            }
        },
        disabled: {
            get: function(device, callback){
                var device = self.getDevice( device.id );
                console.log('device:' + device);
                if( device instanceof Error ) return callback( device );
                
                if(device.state.onoff == 'off'){
                    callback( true );
                }else{
                    callback( false );
                }
            }
        }
    }
}

module.exports = self;
