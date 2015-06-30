var settings = require('../settings.js');
var dgram = require('dgram');
var publishCallback;
var subscribeTopic;

var client = dgram.createSocket("udp4");
client.bind(settings.milight.port, settings.milight.ip);
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
        for(var device in settings.milight.deviceMap){
            for(var datakey in settings.milight.deviceMap[device].dataMap){
                var testMsg = settings.milight.deviceMap[device].dataMap[datakey];
                    if (rxMsg.length == testMsg.length && rxMsg.every(function(u, i) {                                                    return u === testMsg[i];
                            })
                    ) {
                        publishState(device, datakey);
                    } 
                }
            }
        }
});

function doAction(topic, action){
    for(var deviceid in settings.milight.deviceMap){
        if(settings.milight.deviceMap[deviceid].subTopic == topic){
            for(var datakey in settings.milight.deviceMap[deviceid].dataMap){
                if(datakey == action){
                    var message = Buffer(settings.milight.deviceMap[deviceid].dataMap[datakey]);
                    
                    //send the udp message
                    client.send(message, 0, message.length, settings.milight.port, settings.milight.ip,  function(err, bytes) {
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
            {"topic"   : settings.milight.deviceMap[deviceid].pubTopic,
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
    for(var device in settings.milight.deviceMap){
        subscribeTopic(settings.milight.deviceMap[device].subTopic, subscribeCallback);
    }
}



module.exports = function(callback, subscribeCB){
    publishCallback = callback;
    subscribeTopic = subscribeCB;
    subscribeMilightTopics();
}

