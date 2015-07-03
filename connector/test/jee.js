var assert = require('assert');
var jeeDriver = require('../drivers/jee.js');

var config = {
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
    }

var testData = 
    [ { input: "OK G33 34 224 1 250 0",             //legal string
        output: [ { topic: 'pit/office/roomnode/light', payload: '88' },
                  { topic: 'pit/office/roomnode/humidity', payload: 0 },
                  { topic: 'pit/office/roomnode/motion', payload: 1 },
                  { topic: 'pit/office/roomnode/temperature', payload: '25.0' } ]
     },
     { input: "OK G33 34 224 1 250 0 33 23 542",    //legal string with some garbage
        output: [ { topic: 'pit/office/roomnode/light', payload: '88' },
                  { topic: 'pit/office/roomnode/humidity', payload: 0 },
                  { topic: 'pit/office/roomnode/motion', payload: 1 },
                  { topic: 'pit/office/roomnode/temperature', payload: '25.0' } ]
     },
     { input: "OK G34 234 224 1 250 0 33 23 542",    //legal string with some garbage
        output: [ { error: "Received node type is not known" } ]
     }]

module.exports = {
    'this is equals' : function(){
        assert.isNull(null);
    },
    
    'testing jee driver' : function(){
        jeeDriver(config);
        //we skip init because we don't want the driver to connect to the physical device
        var result = jeeDriver.decodeMessage(" G i7 g0 @ 868 MHz"); //setup the driver (group and such)
        
        for(var i in testData){
            var result = jeeDriver.decodeMessage(testData[i].input);   
            assert.eql(result, testData[i].output);
        }
    }
};