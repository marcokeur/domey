var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sleep = require('sleep');
var Gpio = require('onoff').Gpio;

var config, gpio433In, gpio433Out;


function wireless_433()
{
    EventEmitter.call(this);
}

module.exports = wireless_433;

util.inherits(wireless_433, EventEmitter);


wireless_433.prototype.getName = function(){
    return 'wireless_433';
}

wireless_433.prototype.init = function(){
	console.log("433 wireless init");
  
    var self = this;

    config = Domey.getConfig('interfaces', 'wireless_433');

    try{
        gpio433In = new Gpio(config.rxPin, 'in', 'both'); // Export GPIO #4 as an interrupt
        gpio433Out = new Gpio(config.txPin, 'out');

        gpio433In.watch(edgeDetected);
    }catch(ex){
        console.log(ex);
    }
}

wireless_433.prototype.send = function(opts, callback){
    if(typeof gpio433Out == 'undefined'){
        callback(false);
    }else{
        for(var i = 0; i < opts.cycles; i++){
            sendBuffer(buffer.mainSig);
        }
        callback(true);
    }
}

function sendBuffer(buffer){
    var length = buffer.length;

    for(var x = 0; x < buffer.length; x+=2){
        //key on
        gpio433Out.writeSync(1);

        //sleep for period
        sleep.usleep(code[x]);

        //key off
        gpio433Out.writeSync(0);

        //if we haven't reached end of buffer yet
        if(x+1 < buffer.length){
            //sleep for next period
            sleep.usleep(code[x+1]);
        }
    }
}

function edgeDetected(err, value){
    if(err)
        console.log('err: ' + err);

    console.log('edge detected: ' + value);
}


