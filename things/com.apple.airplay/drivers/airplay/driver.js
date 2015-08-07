var airtunes = require('airtunes');
var spawn = require('child_process').spawn;

var self = {
    
    //holds all known devices
    devices: { },

    status : 'initializing',

    init: function( devices, callback ) {

        //var self = this;

        console.log('airplay init');

        self.devices = Domey.getThingConfig('com.apple.airplay', 'devices');
        self.settings = Domey.getThingConfig('com.apple.airplay', 'settings');

        airtunes.on('buffer', function(status){
          // after the playback ends, give some time to AirTunes devices
          if(status === 'end') {
            console.log('playback ended, waiting for AirTunes devices');
                stopStream(self.status, function(res){
                    self.status = res;
                });
          }
        });

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

    capabilities: {
        play: {
            set: function( device, file, callback){
                if(self.status != 'playing'){
                    self.status = 'playing';

                    for(var i in self.devices){
                        airtunes.add(self.devices[i].ip, {'port': self.devices[i].port});
                    }

                    playUsingFFMPEG(file);
                    callback('playback started');
                }else{
                    callback('still playing!');
                }
            }
        },
        stop: {
            set: function(device, callback){
                stopStream(self.status, function(status){
                    self.status = status;
                });
            }
        }
    }
}

function stopStream(status, callback){
    if(status == 'playing'){
        airtunes.stopAll(function() {
            console.log('end');
            airtunes.reset();

            callback('stopped');
        });
    }else{
        callback(status);
    }
}


function playUsingFFMPEG(file){
    this.ffmpeg = spawn(this.settings.ffmpeg, [
        '-i', file,
        '-f', 's16le',        // PCM 16bits, little-endian
        '-ar', '44100',       // Sampling rate
        '-ac', 2,             // Stereo
        'pipe:1'              // Output on stdout
    ]);

    // pipe data to AirTunes
    this.ffmpeg.stdout.pipe(airtunes);

    // detect if ffmpeg was not spawned correctly
    this.ffmpeg.stderr.setEncoding('utf8');
    this.ffmpeg.stderr.on('data', function(data) {
        if(/^execvp\(\)/.test(data)) {
              console.log('failed to start ' + argv.ffmpeg);
              process.exit(1);
        }
    });
}

module.exports = self;
