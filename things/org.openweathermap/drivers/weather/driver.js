var request = require('request');
var settings = Domey.manager('things').getThingMetaData('org.openweathermap', 'settings');

var self = {

    cache: {},

    init: function( devices, callback ){

        var self = this;
        console.log('driver weather init');

        callApi(self);
        setInterval(function(){callApi(self)}, 600000);

        // we're ready
        callback();
    },

    getDeviceIdList: function() {
        var deviceIdList = [ 'system' ];

        return deviceIdList;
    },

    capabilities: {
        temp: {
            get: function (deviceId, callback) {
                callback(self.cache.temp);
            }
        },

        humidity: {
            get: function(deviceId, callback){
                callback(self.cache.humidity);
            }
        },

        pressure: {
            get: function(deviceId, callback){
                callback(self.cache.pressure);
            }
        },

        wind: {
            get: function(deviceId, callback){
                callback(self.cache.wind);
            }
        },

        type: {
            get: function(deviceId, callback){
                callback(self.cache.type);
            }
        },

        icon: {
            get: function(deviceId, callback){
                callback(self.cache.icon);
            }
        }
    }
};

function callApi(self){
    request('http://api.openweathermap.org/data/2.5/weather?q='+settings.location+'&appid='+settings.appid, function(error, response, body){
        if(!error && response.statusCode == 200){
            var result = JSON.parse(body);
            if(typeof result != 'undefined' &&
                typeof result.main != 'undefined'){
                updateCache('temp', result.main.temp);
                updateCache('humidity', result.main.humidity);
                updateCache('pressure', result.main.pressure);
                updateCache('wind', result.wind.speed);
                if(typeof result.rain != 'undefined'){
                    updateCache('rain', result.rain[0]);
                    }else{
                    updateCache('rain', 0);
                    }
                updateCache('type', result.weather[0].description);
                updateCache('icon', 'http://openweathermap.org/img/w/' + result.weather[0].icon + '.png');
            }
        }
    });
}


function updateCache(key, value){
    if(self.cache[key] != value){
        self.cache[key] = value;
        Domey.capabilityUpdated('org.openweathermap', 'weather', 'system', key, value);
    }
}

module.exports = self;
