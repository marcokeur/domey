var util = require('util');
var EventEmitter = require('events').EventEmitter;
var push = require( 'pushover-notifications' );
var config;
var p;


function pushover() {
    EventEmitter.call(this);
}

module.exports = pushover;

util.inherits(pushover, EventEmitter);

pushover.prototype.getName = function () {
    return 'pushover';
}

pushover.prototype.init = function () {
    console.log("pushover init");

    var self = this;

    config = Domey.getConfig('interfaces', 'pushover');
    p = new push(config);

    self.send("Domey just started!", function(result){
        console.log(result);
    });
}

pushover.prototype.send = function (msg, callback) {

    var msg = {
        // These values correspond to the parameters detailed on https://pushover.net/api
        // 'message' is required. All other values are optional.
        message: msg,   // required
        title: "Domey",
        sound: 'magic',
        //device: 'devicename',
        priority: 1
    };

    p.send( msg, function( err, result ) {
        if ( err ) {
            throw err;
        }

        console.log( result );
            callback(result);
    });


}



