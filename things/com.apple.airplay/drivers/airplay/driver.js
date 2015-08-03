var self = {
    
    //holds all known devices
    devices: [ ],

    init: function( devices, callback ) {

        var self = this;

        console.log('airplay init');

        self.browser = require('airplay').createBrowser();

        devices = self.browser.getDevices();

        console.log(self.browser.getDevices());

        self.browser.on('deviceOnline', function(device) {
          console.log('device online: ' + device.id);
          self.devices.push(device);
        });

        self.browser.on('deviceOffline', function(device) {
          console.log('device offline: ' + device.id);
          self.devices.pop(device);
        });
        self.browser.start();
        console.log('airplay devices: ' + devices);

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

    },

    capabilities: {
        play: {
            set: function( device, content, callback){
                var startPosition = 0;

                device.play(content, startPosition, function(res){
                    callback(res);
                });
            }
        },
        stop: {
            set: function(device, callback){
                device.stop();
            }
        }
    }
}

module.exports = self;
