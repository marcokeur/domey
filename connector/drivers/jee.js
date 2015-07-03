var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var decoder = require('./decoders/jee/index.js');

var config;
var configRegex = new RegExp(/^ \w i(\d+)\*? g(\d+) @ (\d\d\d) MHz/);

var publishCallback;
var port;
var driverConfig;

function init(){
    console.log("Jee driver init");
    
    port = new SerialPort(driverConfig.port, {
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
        try{
            var cbData = decodeMessage(msg);
            publishCallback(cbData);
        }catch(e){
            console.log("JeeDriver: something went wrong");   
        }
    });

    port.on('error', function(err) {
        console.log(err);
    });
}

//only use for testing!
function testInit(config){
    console.log("Jee driver testInit");
    
    driverConfig = config;
}


function decodeMessage(msg){
    var decoded;

    if(msg.length < 300){
          tokens = msg.split(' ');
          if(tokens.shift() == 'OK'){
                console.log(msg);
                groupId = tokens[0].substring(1);
                nodeId = tokens[1] & 0x1F
                if(config){
                    prefix = config.band + ":" + groupId + ":"
                }else{
                    prefix = ""
                }
                result = { type: "rf12-" + prefix + nodeId, msg: tokens }

                var cbData = Array();

                //check if this node-type is in our config
                if(driverConfig.deviceMap.hasOwnProperty(result.type)){

                    //send to mqtt   
                    for(var sensor in decoded = decoder.decode(result)){
                        //if this data is known to us
                        if(result.type !== undefined 
                            && driverConfig.deviceMap[result.type] !== undefined
                            && driverConfig.deviceMap[result.type].pubTopic !== undefined){
                            var data = {
                                topic : driverConfig.deviceMap[result.type].pubTopic + "/" + sensor,
                                payload : decoded[sensor]
                            }
                            cbData.push(data);
                        }
                    }
                }else{
                    cbData.push({
                        error : "Received node type is not known"
                    });
                }
          }else{
              //pherhaps the string contains the rf config, lets try to parse
              match = configRegex.exec(msg);
              if(match){        
                  console.log(msg);
                config = { recvid: +match[1], group: +match[2], band: +match[3] }
                console.log('RF12 config:', config);
            }else{
                //unrecognized input, usually a "?" msg
                //result = { type: 'unknown', msg, config }
                //console.log("unkown input: " + msg + " c: " + config);
            }
          }
        }
    return cbData;
}

module.exports = function(config, callback){
    driverConfig = config;
    publishCallback = callback;
}
module.exports.initDriver = init;
module.exports.decodeMessage = decodeMessage;