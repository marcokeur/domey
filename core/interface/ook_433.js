var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sleep = require('sleep');
//var Gpio = require('onoff').Gpio;

var config, gpio433In, gpio433Out;


function ook_433() {
    EventEmitter.call(this);
}

module.exports = ook_433;

util.inherits(ook_433, EventEmitter);


ook_433.prototype.getName = function () {
    return 'ook_433';
}

ook_433.prototype.init = function () {
    console.log("433 wireless init");

    var self = this;

    config = Domey.getConfig('interfaces', 'ook_433');

    try {
        gpio433Out = new Gpio(config.txPin, 'out');
        gpio433Out.writeSync(0);
    } catch (ex) {
        console.log(ex);
    }
}

ook_433.prototype.send = function (trits, periodicity, repeats, callback) {
    var success;

    /** create a buffer containing the timeperiods between a high-low or low-high
        edge. Most OOK protocols use 3 states for this (0, 1, 2), based on a fixed
        time periodicity
    */
    var buffer = [];
    for (var i in trits) {
        switch (trits[i]) {

            case 0:
                buffer.push(periodicity);
                buffer.push(periodicity * 3);
                buffer.push(periodicity);
                buffer.push(periodicity * 3);
                break;
            case 1:
                buffer.push(periodicity * 3);
                buffer.push(periodicity);
                buffer.push(periodicity * 3);
                buffer.push(periodicity);
                break;
            case 2:
                buffer.push(periodicity);
                buffer.push(periodicity * 3);
                buffer.push(periodicity * 3);
                buffer.push(periodicity);
                break;
        }
    }
    buffer.push(periodicity);
    buffer.push(periodicity * 31);


    for (var i = 0; i < repeats; i++) {
        success = sendBuffer(buffer);
    }

    if(!success)
        Domey.log(0, 0, 'Failed sending');

    callback(success);
}

function sendBuffer(buffer) {
    if (typeof gpio433Out != 'undefined') {
        for (var x = 0; x < buffer.length; x += 2) {
            //key on
            gpio433Out.writeSync(1);

            //sleep for period
            sleep.usleep(buffer[x]);

            //key off
            gpio433Out.writeSync(0);

            //if we haven't reached end of buffer yet
            if (x + 1 < buffer.length) {
                //sleep for next period
                sleep.usleep(buffer[x + 1]);
            }
        }
        return true;
    } else {
        return false;
    }
}

function edgeDetected(err, value) {
    if (err)
        console.log('err: ' + err);

    console.log('edge detected: ' + value);
}


