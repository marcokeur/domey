var dgram = require('dgram');
var publishCallback;
var subscribeTopic;
var driverConfig;


var client = dgram.createSocket("udp4");

function createSocket(){
    client.bind(driverConfig.port, driverConfig.ip);
    client.on("listening", function () {
        client.setBroadcast(true);
        var address = client.address();
        console.log('UDP Server listening on ' + address.address + ":" + address.port);

    });

    client.on('message', function (message, remote) {
        var rxMsg = Array();

        rxMsg.push(message[0]);
        rxMsg.push(message[1]);
        rxMsg.push(message[2]);

        //milight always ends in 0x55
        if(rxMsg[2] == 0x55){
            for(var device in driverConfig.deviceMap){
                for(var datakey in driverConfig.deviceMap[device].dataMap){
                    var testMsg = driverConfig.deviceMap[device].dataMap[datakey];
                        if (rxMsg.length == testMsg.length && rxMsg.every(function(u, i) {                                                    return u === testMsg[i];
                                })
                        ) {
                            publishState(device, datakey);
                        } 
                    }
                }
            }
    });
}

function doAction(topic, action){
    for(var deviceid in driverConfig.deviceMap){
        if(driverConfig.deviceMap[deviceid].subTopic == topic){
            for(var datakey in driverConfig.deviceMap[deviceid].dataMap){
                if(datakey == action){
                    var message = Buffer(driverConfig.deviceMap[deviceid].dataMap[datakey]);
                    
                    //send the udp message
                    client.send(message, 0, message.length, driverConfig.port, driverConfig.ip,  function(err, bytes) {
                        //udp packet send
                        console.log("set the " +topic+" " + action);
                    });
                }
            }
        }
    }
}

function publishState(deviceid, datakey){
        var cbData = [
            {"topic"   : driverConfig.deviceMap[deviceid].pubTopic,
             "payload" : datakey
            }
        ]
        publishCallback(cbData);
}

function subscribeCallback(topic, message){
    console.log("milight.subscribeCallback: " + topic);
    doAction(topic, message);
}

function subscribeMilightTopics(){
    for(var device in driverConfig.deviceMap){
        subscribeTopic(driverConfig.deviceMap[device].subTopic, subscribeCallback);
    }
}

function init(){
    console.log("Milight driver init");
    subscribeMilightTopics();
    createSocket();
}

module.exports = function(config, callback, subscribeCB){
    driverConfig = config;
    publishCallback = callback;
    subscribeTopic = subscribeCB;
}

module.exports.initDriver = init;

