var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var port;
var config;
var configRegex = new RegExp(/^ \w i(\d+)\*? g(\d+) @ (\d\d\d) MHz/);

var self = {
    
    //holds all known devices
    devices: [ ],

    init: function( devices, callback ) {

        port = new SerialPort('/dev/ttyUSB1', {
                parser: serialport.parsers.readline("\n"),
                baudRate: 57600,
                dataBits: 8,
                parity: 'none',
                stopBits: 1
            }, function(err) {
                console.log("port open");
                port.write("h\r");
        });

        port.on('data', function(msg) {
            decodeMessage(msg, function(package){
                stored = false;
                for(var i in self.devices){
                    if(self.devices[i].id == package.id){
                        self.devices[i] = package;
                        stored = true;
                    }
                }
                if(stored == false){
                    console.log("New device found! --> " + package.id);
                    self.devices.push(package);
                }

                // emit realtime event if something has changed
                Object.keys(package.state).forEach(function(sensor){
                    Manager.manager('drivers').realtime({
                        thing: 'org.jeenode',
                        driver: 'roomnode',
                        device: package.id, 
                        state: {
                            type: sensor,
                            value: package.state[sensor]
                        }
                    });
                });
            });
        });

        port.on('error', function(err) {
            console.log(err);
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

        onoff: {
            get: function( device, callback ){
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                callback( device.state.onoff );
            },
            set: function( device, onoff, callback ) {
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                if(onoff){
                    device.state.onoff = 'on';
                }else{
                    device.state.onoff = 'off';
                }
                self.update( device.id );

                callback( device.state.onoff );
            }
        }
    }
}

module.exports = self;
    
    
function decodeMessage(msg, callback){
    var decoded;
    var cbData = [];
    if(msg.length < 300){
          tokens = msg.split(' ');
          if(tokens.shift() == 'OK'){
              groupId = tokens[0].substring(1);
              nodeId = tokens[1] & 0x1F;
              
              if(config){
                  prefix = config.band + ":" + groupId + ":"
              }else{
                  prefix = ""
              }
                
              result = { type: "rf12-" + prefix + nodeId, msg: tokens }

              callback(decodeRoomNodeMessage(result));
                
          }else{
              //pherhaps the string contains the rf config, lets try to parse
              match = configRegex.exec(msg);
              if(match){        
                    config = { recvid: +match[1], group: +match[2], band: +match[3] }
                    console.log('RF12 config:', config);
                }else{
                    //unrecognized input, usually a "?" msg
                    //result = { type: 'unknown', msg, config }
                    //console.log("unkown input: " + msg + " c: " + config);
                }
          }
    }
    //return cbData;
}

function decodeRoomNodeMessage(data){
      raw = data.msg
      temperature = (((256 * (raw[5]&3) + raw[4]) ^ 512) - 512).toString();
      temperature = temperature.substring(0,2) + '.' + temperature.substring(temperature.length -1);
    
      retvalue = {
          id: data.type,
          state : {
              light: Number((raw[2] / 255 * 100)).toFixed(), 
              humidity: raw[3] >> 1, 
              motion: raw[3] & 1, 
              temperature: temperature 
          }
      }
      return retvalue;
}