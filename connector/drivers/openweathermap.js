var settings = require('../settings.js');
var schedule = require('node-schedule');
var request = require('request');

var publishCallback;

var j = schedule.scheduleJob('0 * * * *', function(){
    publishForcast();
});

function publishForcast(){
    
    var url = "http://api.openweathermap.org/data/2.5/forecast/daily?q=" 
            + settings.openweathermap.location 
            + "&mode=json&units=metric&cnt=7";

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var weather = JSON.parse(body);
            var cbData = [
                {"topic"    : "pit/" + settings.openweathermap.location + "/forecast/tody/temperature",
                 "payload"  : weather.list[0].temp.day}
                ]
            publishCallback(cbData);
        }
    });
}

module.exports = function(publish, subscribe){
    publishCallback = publish; 
}