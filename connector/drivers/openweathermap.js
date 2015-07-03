var schedule = require('node-schedule');
var request = require('request');

var publishCallback;
var driverConfig;

var j = schedule.scheduleJob('0 * * * *', function(){
    publishForcast();
});

function init(){
    console.log("Openweathermap driver init");   
}

function publishForcast(){
    
    var url = "http://api.openweathermap.org/data/2.5/forecast/daily?q=" 
            + driverConfig.location 
            + "&mode=json&units=metric&cnt=7";

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var weather = JSON.parse(body);
            var cbData = [
                {"topic"    : "pit/" + driverConfig.location + "/forecast/tody/temperature",
                 "payload"  : weather.list[0].temp.day}
                ]
            publishCallback(cbData);
        }
    });
}

module.exports = function(config, publish, subscribe){
    driverConfig = config;
    publishCallback = publish; 
}

module.exports.initDriver = init;
