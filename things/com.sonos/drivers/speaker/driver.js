var sonos = require('sonos');

var speakers = [];
	
//var self = module.exports;

var self = {

	init: function( devices, callback ){

		sonos
			.search()
			.on('DeviceAvailable', function (device, model) {

				device.deviceDescription(function(err, metadata){
					if( err ) return;

					speakers.push({
						name: metadata.roomName + ' (' + metadata.displayName + ')',
						data: {
							id: metadata.UDN, //metadata.serialNum,
							host: device.host,
							port: device.port
						}
					});

				})

			});

		// we're ready
		callback();
	},

	getDeviceIdList: function() {
    	var deviceIdList = [];

		return deviceIdList;
	},

	play: function (host, uri) {
		var sonosDevice = new sonos.Sonos(host);

		sonosDevice.play(uri, function (err, playing) {
			console.log([err, playing]);
		});
	},

	stop: function(host, uri) {
		var sonosDevice = new sonos.Sonos(host);

		sonosDevice.stop(function (err) {
			console.log(err);
		});
	},

	pause: function(host, uri) {
		var sonosDevice = new sonos.Sonos(host);

		sonosDevice.pause(function (err) {
			console.log(err);
		});
	}
}

module.exports = self;
