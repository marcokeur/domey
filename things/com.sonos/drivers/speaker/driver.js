var sonos			= require('sonos');

var speakers = [];
	
//var self = module.exports;

var self = {

	init: function( devices, callback ){

		sonos
			.search()
			.on('DeviceAvailable', function(device){
				console.log('DeviceAvailable: ' + JSON.stringify(device));

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

			})

		Domey.manager('web').addApiCall("GET", 'com.sonos', self.apiGetCollection, self.apiGetElement);
	
		// we're ready
		callback();
	},

	apiGetCollection: function() {
		var response = [];

		//set http response code
		response['status'] = 200;
		response['data'] = self.speakers;

		return response;
	},

	apiGetElement: function(element){
		var response = [];

		//find the specific flow
		for(var i in self.speakers){
			//if correct flow is found
			if(self.speakers[i].id == element){
				//set http response code
				response['status'] = 200;
				response['data'] = self.speakers[i];

				return response;
			}
		}

		response['status'] = 404;
		return response;
	},

	capabilities: {
		radio: {
			get: function( device, name, callback ){
				var sonos = new Sonos('192.168.1.100');
				sonos.play('http://icecast.omroep.nl/3fm-bb-mp3', function(err, playing){
					console.log([err, playing]);
				})
			},
			set: function( device, name, callback ){

			}
		}
	}
}

module.exports = self;
