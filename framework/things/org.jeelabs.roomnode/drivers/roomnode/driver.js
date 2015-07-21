var self = {
    
    //holds all known devices
    devices: [ ],

    init: function( devices, callback ) {
        console.log('driver: ' + Domey.interface('jeelink_868').getName());
        //we listen to jeelabs type data
        Domey.interface('jeelink_868').on('jeelabs', function(package){
                    decodeRoomNodeMessage(package, function(roomnodePackage){
                        console.log(roomnodePackage);
                        stored = false;
                        for(var i in self.devices){
                            if(self.devices[i].id == roomnodePackage.id){
                                self.devices[i] = roomnodePackage;
                                stored = true;
                            }
                        }
                        
                        if(stored == false){
                            console.log("New device found! --> " + roomnodePackage.id);
                            self.devices.push(roomnodePackage);
                        }
                        
                        // emit realtime event if something has changed
                        Object.keys(roomnodePackage.state).forEach(function(sensor){
                            Domey.manager('drivers').realtime({
                                thing: 'org.jeenode.roomnode',
                                driver: 'roomnode',
                                device: roomnodePackage.id, 
                                state: {
                                    type: sensor,
                                    value: roomnodePackage.state[sensor]
                                }
                            });
                        });

                        //emit a flow trigger
                        Domey.manager('flow').trigger('measurement', {
                            'light' : roomnodePackage.state.light
                        });

                    });
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
 
    capabilities: {

        temperature: {
            get: function( device, callback ){
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                callback( device.state.temperature );
            }
        },
        light: {
            get: function( device, callback ){
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                callback( device.state.light );
            }
        },
        motion: {
            get: function( device, callback ){
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                callback( device.state.motion );
            }
        }        
    }
}

module.exports = self;

function decodeRoomNodeMessage(data, callback){
      raw = data.msg
      temperature = (((256 * (raw[5]&3) + raw[4]) ^ 512) - 512).toString();
      temperature = temperature.substring(0,2) + '.' + temperature.substring(temperature.length -1);
    
      package = {
          id: data.type,
          state : {
              light: Number((raw[2] / 255 * 100)).toFixed(), 
              humidity: raw[3] >> 1, 
              motion: raw[3] & 1, 
              temperature: temperature 
          }
      }
      callback(package);
}