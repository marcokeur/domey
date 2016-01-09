var util = require('util');
var EventEmitter = require('events').EventEmitter;
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var fs;
var port;
var rf12Config;
var rf12ConfigRegex = new RegExp(/^ \w i(\d+)\*? g(\d+) @ (\d\d\d) MHz/);

//interface config
var config;

function JeeLink_868() 
{
    EventEmitter.call(this);
}

module.exports = JeeLink_868;

util.inherits(JeeLink_868, EventEmitter);


JeeLink_868.prototype.getName = function(){
    return 'jeelink_868';   
}

JeeLink_868.prototype.init = function(){
    config = Domey.getConfig('interfaces', 'jeelink_868');
    
    port = new SerialPort(config.port, {
        parser: serialport.parsers.readline("\n"),
        baudRate: 57600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1
    }, function(err) {
        port.write("h\r");
    });

    var self = this;

    port.on('data', function(msg) {
        if(msg.length < 300){
            tokens = msg.split(' ');

            //pherhaps the string contains the rf config, lets try to parse
            match = rf12ConfigRegex.exec(msg);
            if(match){        
                rf12Config = { recvid: +match[1], group: +match[2], band: +match[3] }
                //emit the config
                self.emit('config', config);
            }else if(tokens.shift() == 'OK'){
                //this is een jeelabs protocol package
                groupId = tokens[0].substring(1);
                nodeId = tokens[1] & 0x1F;
                
                //if config is known
                if(rf12Config){
                    prefix = rf12Config.band + ":" + groupId + ":"
                    result = { type: "rf12-" + prefix + nodeId, msg: tokens }
                
                    //emit te package
                    self.emit('jeelabs', result);
                }
            }else{
                //unrecognized input, usually a "?" msg
                //lets pass it raw into the system
                self.emit('raw', msg);
            }
        }
    });
    
    port.on('error', function(err) {
        Domey.log(0, 0, err);
    });
};
