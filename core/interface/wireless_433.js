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
    var success;
    for(var i = 0; i < opts.cycles[0]; i++){
        if(typeof opts.startSig != 'undefined')
            success = sendBuffer(opts.startSig);

        var bitCounter = 0;
        while(bitCounter != opts.mainSig[4]){
            var bitList = (opts.mainSig[bitCounter/8] >>> 0).toString(2);

            for(var j = 0; j < 8; j++){
                var bit = bitList[j];

                if(bit == 1){
                    success = sendBuffer(opts.lowSig);
                }else{
                    success = sendBuffer(opts.highSig);
                }

                bitCounter++;

                if(bitCounter == opts.mainSig[4]){
                    break;
                }
            }

        }

        if(typeof opts.endSig != 'undefined')
            success = sendBuffer(opts.endSig);

    }

    callback(success);
}

function sendBuffer(buffer){
    var length = buffer.length;

    if(gpio433Out == 'undefined'){
        for(var x = 0; x < buffer.length; x+=2){
            //key on
            gpio433Out.writeSync(1);

            //sleep for period
            sleep.usleep(buffer[x]);

            //key off
            gpio433Out.writeSync(0);

            //if we haven't reached end of buffer yet
            if(x+1 < buffer.length){
                //sleep for next period
                sleep.usleep(buffer[x+1]);
            }
        }
        return true;
    }else{
        Domey.log(0, 0, 'Failed sending out: ' + JSON.stringify(buffer));
        return false;
    }
}

function edgeDetected(err, value){
    if(err)
        console.log('err: ' + err);

    console.log('edge detected: ' + value);
}


