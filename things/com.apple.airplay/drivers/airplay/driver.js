var spawn = require('child_process').spawn;

var self = {

    //holds the players
    players: [ ],

    //holds all known devices
    devices: { },

    settings: { },

    status : 'initializing',

    init: function( devices, callback ) {

        console.log('airplay init');

        self.devices = Domey.getThingConfig('com.apple.airplay', 'devices');
        self.settings = Domey.getThingConfig('com.apple.airplay', 'settings');

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
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                addPlayer(function(player){
                    self.players.push(player);

                    var airtunes_device = player.airtunes.add(device.ip, {'port': device.port});

                    if(player.status != 'play'){
                        player.status = 'play';

                        airtunes_device.on('status', function(status){
                            console.log("Device status ->" + status);
                            if(status == 'ready'){
                                playFile(player, file);
                                callback('playback started: ' + file);
                            }
                        });

                        player.airtunes.on('buffer', function(status){
                            // after the playback ends, give some time to AirTunes devices
                            if(status === 'end') {
                                console.log('playback ended, waiting for AirTunes devices');

                                setTimeout(function(){
                                    player.airtunes.stopAll(function(){
                                        player.airtunes.reset();
                                        console.log('all done, buffer reset');
                                    });
                                }, 2000);
                            }
                        });

                        callback();
                    }else{
                        callback(new Error("still playing"));
                    }
                });

            }
        },
        stop: {
            set: function(playerid, callback){
                console.log(self.players);
                console.log(playerid);
                self.players[playerid.id].airtunes.stopAll(function(){
                    callback();
                });
            }
        },
        volume:{
            set: function(device, value, callback){
                device.setVolume(volume);
                callback();
            }
        }
    }
}

function addPlayer(cb){
    var player = {};
    player.airtunes = require('airtunes');

    player.status = 'stop';

    cb(player);
}

function playFile(player, file){
    ffmpeg = spawn(self.settings.ffmpeg, [
        '-i', file,
        '-f', 's16le',        // PCM 16bits, little-endian
        '-ar', '44100',       // Sampling rate
        '-ac', 2,             // Stereo
        'pipe:1'              // Output on stdout
    ]);

    ffmpeg.stdout.pipe(player.airtunes);

    // detect if ffmpeg was not spawned correctly
    ffmpeg.stderr.setEncoding('utf8');
    ffmpeg.stderr.on('data', function(data) {
        if(/^execvp\(\)/.test(data)) {
              console.log('failed to start ' + argv.ffmpeg);
              process.exit(1);
        }
    });
}

module.exports = self;
