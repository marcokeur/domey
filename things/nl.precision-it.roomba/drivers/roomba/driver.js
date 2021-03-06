var self = {
    devices : {},

    init: function( init_devices, callback ) {
        //var self = this;

        Domey.interface('mqtt').subscribe('pit/roomba/state');
        Domey.interface('mqtt').on('pit/roomba/state', function(data){
            //received data from roomba!
            console.log('received from roomba: ' + data);

            var tokens = data.toString().split(' ');
            if(tokens[0] == 'advertise'){
                if(tokens.length == 4){
                    self.devices [ tokens[1] ] = {
                        id: tokens[1],
                        name: tokens[2],
                        ip: tokens[3],
                        state: {
                            cleaning : false,
                            spot_cleaning : false,
                            docked : false,
                            charging : false
                        }
                    };
                    Domey.log(3, 2, 'Found new cleaner ' + tokens[2] + ' at ' + tokens[3]);
                }
            }else{
                //first token is device id
                var device = roomba.getDevice(tokens[1]);

                if( !(device instanceof Error )){
                    roomba.updateStatus(device, tokens);
                }
            }
        });

        callback();
    },
    
    //holds roomba data
    statusCache: {},

    getDeviceIdList: function() {
        var deviceIdList = [];

        for(var i in this.devices){
            deviceIdList.push(i);
        }

        return deviceIdList;
    },

	getDevice: function( id ) {
		if( typeof this.devices[id] == 'undefined' ) return new Error("device is not connected (yet)");

		return this.devices[id];
	},
    
    getStatus: function( device, callback) {
        callback(device.state);
    },
    
    command: function(device, command, callback ){
        Domey.interface('mqtt').publish('pit/roomba/cmd', command, function(){
            console.log('Roomba command: ' + command + ' published');
            callback();
        });
    },
    
    updateStatus: function(device, data){
        var state = {};
        
        if(data[0] == "cleaning"){
                state.cleaning = true;
                state.spot_cleaning = false;
                state.docked = false;
                state.charging = false;
        }else if(data[0] == "spot_cleaning"){
                state.cleaning = true;
                state.spot_cleaning = true;
                state.docked = false;
                state.charging = false;
        }else if(data[0] == "docked"){
                state.cleaning = false;
                state.spot_cleaning = false;
                state.docked = true;
                state.charging = false;
        }else if(data[0] == "charging"){
                state.cleaning = false;
                state.spot_cleaning = false;
                state.docked = true;
                state.charging = true;
        }

        if( typeof roomba.statusCache[ device.id ] == 'undefined' ) {
            roomba.statusCache[ device.id ] = JSON.stringify(state);   
        }
        
        if( roomba.statusCache[ device.id ] != JSON.stringify(state)){
            roomba.statusCache[device.id] = JSON.stringify(state);
            Domey.manager('drivers').realtime({
                                thing: 'nl.precision-it.roomba',
                                driver: 'roomba',
                                device: device.id, 
                                state: state
                            });
        }
    },



    capabilities : {
        state: {
            get: function( deviceId, callback ){
                var device = roomba.getDevice( deviceId );
                if( device instanceof Error ) return callback( device );

                self.getStatus( device, callback );
            },
            set: function( deviceId, state, callback ) {
                var device = roomba.getDevice( deviceId );

                if( typeof state.cleaning != 'undefined' )
                    module.exports.cleaning.set(device, state.cleaning, function(){} );
                if( typeof state.spot_cleaning != 'undefined' )
                    module.exports.spot_cleaning.set( device, state.spot_cleaning, function(){} );
                if( typeof state.docked != 'undefined' ) module.exports.docked.set(device, state.docked, function(){} );

                if( device instanceof Error ) return callback( device );

                self.getStatus( device, callback );
            }
        },

        cleaning: {
            get: function( deviceId, callback ){
                var device = self.getDevice( deviceId );
                if( device instanceof Error ) return callback( device );

                self.getStatus( device, function(state){
                    callback( state.cleaning );
                });

            },
            set: function( deviceId, value, callback ){

                var device = self.getDevice( deviceId );
                if( device instanceof Error ) return callback( device );

                // first, get the status
                self.getStatus( device, function(state){
                    console.log('roomba status: ' + state);
                    // then, set the status (because clean simulates a button press, not really start/stop)
                    if( (state.cleaning && value) || (!state.cleaning && !value) ) {
                        callback( value );
                    } else if( (state.cleaning && !value) || (!state.cleaning && value) ) {
                        self.command( device, 'wakeup', function(){
                            self.command( device, 'clean', function(){
                                callback( value );
                            });
                        });
                    }
                });

            }
        },
        spot_cleaning: {
            get: function( deviceId, callback ){
                var device = self.getDevice( deviceId );
                if( device instanceof Error ) return callback( device );

                self.getStatus( device, function(state){
                    callback( state.spot_cleaning );
                });

            },
            set: function( deviceId, value, callback ) {
                // TODO
            }
        },
        docked: {
            get: function( deviceId, callback ){
                var device = self.getDevice( deviceId );
                if( device instanceof Error ) return callback( device );

                self.getStatus( device, function(state){
                    callback( state.docked );
                });

            },
            set: function( deviceId, value, callback ) {
                var device = self.getDevice( deviceId );
                if( device instanceof Error ) return callback( device );

                // first, get the status
                self.getStatus( device, function(state){

                    if( (state.docked != value) && (value == true)) {
                        self.command( device, 'dock', function(state){
                            callback( value );
                        });
                    }else{
                            callback( false );
                    }
                });
            }
        },
        charging: {
            get: function( deviceId, callback ){
                var device = self.getDevice( deviceId );
                if( device instanceof Error ) return callback( device );

                self.getStatus( device, function(state){
                    callback( state.charging );
                });
            }
        },
        battery_level: {
            get: function( deviceId, callback ){
                var device = self.getDevice( deviceId );
                if( device instanceof Error ) return callback( device );

                self.getStatus( device, function(state){
                    callback( state.battery_level );
                });
            }
        }
    }
};

module.exports = self;