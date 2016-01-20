var request = require('request');
var settings = Domey.manager('things').getThingMetaData('nl.precision-it.time', 'settings');

var self = {

    cache: {},

    init: function( devices, callback ){

        var self = this;
        console.log('driver time init');

        recalculate(self);
        callApi(self);

        setInterval(function(){recalculate(self)}, 1000);
        setInterval(function(){callApi(self)}, 600000);

        // we're ready
        callback();
    },

    getDeviceIdList: function() {
        var deviceIdList = [ 'system' ];

        return deviceIdList;
    },

    capabilities: {
        time: {
            get: function (deviceId, callback) {
                callback(self.cache.time);
            }
        },

        date: {
            get: function(deviceId, callback){
                callback(self.cache.date);
            }
        },

        sunrise: {
            get: function(deviceId, callback){
                callback(self.cache.sunrise);
            }
        },

        sunset: {
            get: function(deviceId, callback){
                callback(self.cache.sunset);
            }
        }
    }
};

function recalculate(self){
    var date = Date.now();
/*
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
*/
    //updateCache('time', hour + ":" + min + ":" + sec);
    //updateCache('date', day + "-" + month + "-" + year);
    updateCache('time', date);
}

function callApi(self){
    request('http://api.sunrise-sunset.org/json?lat='+settings.latitude+'&lng='+settings.longitude+'&date=today', function(error, response, body){
        if(!error && response.statusCode == 200){
            updateCache('sunrise', convertTo24Hour(JSON.parse(body).results.sunrise));
            updateCache('sunset', convertTo24Hour(JSON.parse(body).results.sunset));
        }
    });
}

function convertTo24Hour(time) {
    var hours = parseInt(time.substr(0, 2));
    if(time.indexOf('AM') != -1 && hours == 12) {
        time = time.replace('12', '0');
    }
    if(time.indexOf('PM')  != -1 && hours < 12) {
        time = time.replace(hours, (hours + 12));
    }
    return time.replace(/(am|pm)/i, '');
}

function updateCache(key, value){
    if(self.cache[key] != value){
        self.cache[key] = value;
        Domey.capabilityUpdated('nl.precision-it.time', 'time', 'system', key, value);
    }
}

module.exports = self;
