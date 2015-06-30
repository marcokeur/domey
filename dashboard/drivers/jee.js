var settings = require('../settings.js');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var decoder = require('./decoders/jee/index.js');

var config;
var configRegex = new RegExp(/^ \w i(\d+)\*? g(\d+) @ (\d\d\d) MHz/);

var port = new SerialPort(settings.jee.port, {
        parser: serialport.parsers.readline("\n"),
        baudRate: 57600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1
    }, function(err) {
        console.log("port open");
        port.write("h\r");
});

var publishCallback;


port.on('data', function(msg) {
    var decoded;
    
    if(msg.length < 300){
      tokens = msg.split(' ');
      if(tokens.shift() == 'OK'){
            groupId = tokens[0].substring(1);
            nodeId = tokens[1] & 0x1F
            if(config){
                prefix = config.band + ":" + groupId + ":"
            }else{
                prefix = ""
            }
            result = { type: "rf12-" + prefix + nodeId, msg: tokens }

            var cbData = Array();
          
            //send to mqtt   
            for(var sensor in decoded = decoder.decode(result)){
                var data = {
                    topic : settings.jee.deviceMap[result.type].pubTopic + "/" + sensor,
                    payload : decoded[sensor]
                }
                cbData.push(data);
            }
            publishCallback(cbData);
      }else{ 
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
        //publishCallback(decoded);
});

port.on('error', function(err) {
    console.log(err);
});

module.exports = function(callback){
    publishCallback = callback;
}