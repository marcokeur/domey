var assert = require('assert');
var milightDriver = require('../drivers/milight.js');

var config = {
        ip: "255.255.255.255",
        port: 8899,
        deviceMap: [
            {
                "subTopic" : "pit/livingroom/milight/action",
                "pubTopic" : "pit/livingroom/milight/state",
                "dataMap" : {
                    "on"  : [0x45, 0x03, 0x55],
                    "off" : [0x46, 0x03, 0x55]
                }
            },
            {
                "subTopic" : "pit/bedroom/milight/action",
                "pubTopic" : "pit/bedroom/milight/state",
                "dataMap" : {
                    "on"  : [0x47, 0x03, 0x55],
                    "off" : [0x48, 0x03, 0x55]
                }
            }
            
        ]
    }

var subscriptions = {};

module.exports = {
    'testing milight driver initialization' : function(){
        milightDriver(config, function(){
            console.log("cb");
        },
        function(topic, message){
            console.log("cb2");
            subscriptions[topic] = message;
        });
        //milightDriver.initDriver();
        console.log(subscriptions);
        assert.isNotNull(subscriptions);
    }
};