module.exports = {
    // the hostname of the MQTT broker to send and receive messages to
    mqttHost: "test.mosquitto.org",

    // the tcp port that the MQTT broker listening on
    mqttPort: 1883,

    // Retry time in milliseconds for MQTT connections
    mqttReconnectTime: 15000,

    // Enabled verbose logging output
    //verbose: true
    
    //basetopic to log to mongodb
    mqttBaseTopic: "pit",
    
    //driver stuff
    jee: {
        port: "/dev/ttyUSB1",
        //connect a node id to a decoder here
        deviceMap: {
            "rf12-868:33:1" : {
                "type" : "roomnode",
                "location" : "livingroom",
                "pubTopic" : "pit/livingroom/roomnode"
            },

            "rf12-868:33:2" : {
                "type" : "roomnode",
                "location" : "office",
                "pubTopic" : "pit/office/roomnode"
            },
        }
    },
    milight: {
        ip: "255.255.255.255",
        port: 8899,
        deviceMap: [
            {
                "subTopic" : "pit/livingroom/milight/action",
                "pubTopic" : "pit/livingroom/milight/state",
                "dataMap" : {
                    "on"  : [0x42, 0x03, 0x55],
                    "off" : [0x41, 0x03, 0x55]
                }
            }
        ]
    }
}