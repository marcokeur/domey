var Milight = require('node-milight-promise').MilightController;
var commands = require('node-milight-promise').commands;

var light;

var self = {
    
    //holds all known devices
    devices: [
        {   id:     1,
            name:   'group1',
            type:   'rgbw',
            state: {
                enabled:  false
            }
        },
        {   id:     2,
            name:   'group2',
            type:   'rgbw',
            state: {
                enabled: false
            }
        }
    ],

    init: function( devices, callback ) {
        this.light =  new Milight({
                     	ip: '255.255.255.255',
                     	port: 8899,
                     	delayBetweenCommands: 100,
                     	commandRepeat: 1
                     });

        //for test
        //Domey.manager('web').addApiCall("GET", 'com.milight', self.apiGetCollection, self.apiGetElement);

        callback();
    },
/*
    apiGetCollection: function() {
        var response = [];

        //set http response code
        response['status'] = 200;
        response['data'] = self.devices;

        return response;
    },

    apiGetElement: function(element){
        var response = [];

        //find the specific flow
        for(var i in self.devices){
            //if correct flow is found
            if(self.devices[i].id == element){
                //set http response code
                response['status'] = 200;
                response['data'] = self.devices[i];

                return response;
            }
        }

        response['status'] = 404;
        return response;
    },
*/
	getDevice: function( id ) {
	    for(var i in this.devices){
	        if(this.devices[i].id == id){
	            return this.devices[i];
	        }
	    }

		return new Error("device is not connected (yet)");

	},
    
    getStatus: function( device ) {
        return device;
    },
    
    update: function( id ) {
        var device = self.getDevice( id );

        if(device.state.enabled){
            this.light.sendCommands(commands['rgbw'].on(device.id));
            this.light.sendCommands(commands.rgbw.whiteMode(device.id));
        }else{
            this.light.sendCommands(commands['rgbw'].off(device.id));
        }

        this.light.sendCommands(commands['rgbw'].brightness(device.state.brightness));

        if (device.state.hue == "0") {
            this.light.sendCommands(commands.rgbw.whiteMode(device.id));
        } else {
            this.light.sendCommands(commands.rgbw.hue(commands.rgbw.hsvToMilightColor(Array(device.state.hue, 0, 0))));
        }
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

                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                device.state.enabled = onoff;

                self.update( device.id );

                callback( device.state.enabled );
            }
        },
        disabled: {
            get: function(device, callback){
                var device = self.getDevice( device.id );

                if( device instanceof Error ) return callback( device );
                
                if(device.state.enabled == false){
                    callback( true );
                }else{
                    callback( false );
                }
            }
        },
        brightness: {
            get: function( device, callback ){
                callback( device.state.brightness );
            },
            set: function( device, value, callback ){
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                device.state.brightness = value;

                self.update( device.id );

                callback( device.state.brightness );
            }

        },
        hue: {
            get: function( device, callback ){
                callback( device.state.hue );
            },
            set: function( device, value, callback ){
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                device.state.hue = value;

                self.update( device.id );

                callback( device.state.hue );
            }

        }
    }
}

module.exports = self;
