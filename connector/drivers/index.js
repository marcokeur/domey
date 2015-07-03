var mqtt = require('mqtt');
var settings = require('../settings');
var subscriptionList;
var driverList = {};

// Connect to the MQTT sever
client = mqtt.connect({ host: settings.mqttHost, port: settings.mqttPort});

client.on('connect', function () {
    subscriptionList = {};
    
    requireDrivers();

    for(var driver in driverList){
        console.log(driver);
        driverList[driver].initDriver();   
    }
});

client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());
    //do callback to driver
    subscriptionList[topic](topic, message);
    
});

function requireDrivers(){
    require('fs').readdirSync(__dirname + '/').forEach(function(file) {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
        var name = file.replace('.js', '');
        driverList[name] = require('./' + file);
        driverList[name](settings[name], publishCallback, subscribeCallback);
      }
    });
}

function publishCallback(data){
    for(var i in data){
        client.publish(data[i].topic, data[i].payload.toString());   
        console.log("published: " + data[i].payload + " to " + data[i].topic);
    }
}

function subscribeCallback(topic, callback){
    subscriptionList[topic] = callback;
    client.subscribe(topic);
    console.log(topic + " registered by driver");
}