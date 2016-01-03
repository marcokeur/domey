var self = {

    cache: {},

    init: function( devices, callback ){

        var self = this;
        console.log('driver time init');

        setInterval(function(){
            recalculate(self)
            }
            , 1000

        );

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
                callback('07:00');
            }
        },

        sunset: {
            get: function(deviceId, callback){
                callback('18:00');
            }
        }
    }
};

function recalculate(self){
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;


    var day = date.getDay() + 1;
    var month  = date.getMonth() + 1;
    var year  = date.getFullYear();

    updateCache('time', hour + ":" + min + ":" + sec);
    updateCache('date', day + "-" + month + "-" + year);
}

function updateCache(key, value){
    if(self.cache[key] != value){
        self.cache[key] = value;
        Domey.capabilityUpdated('nl.precision-it.time', 'time', 'system', key, value);
    }
}

module.exports = self;
