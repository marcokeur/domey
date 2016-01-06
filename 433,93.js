var sleep = require('sleep');
var kaku = require('./kaku.js');
var Gpio = require('onoff').Gpio;  // Constructor function for Gpio objects.
//var gpio433In = new Gpio(4, 'in', 'both'); // Export GPIO #4 as an interrupt
var gpio433Out = new Gpio(26, 'out');

//the average time it takes nodejs/raspi to set a gpio pin high,
//we subtract this from the delays we want to wait so it doesn't
//impact the timings too much
var raspiUsdelay = 150;

var lowPulse  = [ 295, 1180, 295, 1180];    //low third pulse, means 1
var highPulse = [ 295, 1180, 1180, 295];    //high third pulse, means 0
var endPulse  = [ 295, 11210 ];             //send at end of sequence

function dec2bin(dec){
    return (dec >>> 0).toString(2);
}

while(true){
    createCode(1, 1, 0);
    gpio433send(code, code.length, 10);

    createCode(1, 1, 1);
    gpio433send(code, code.length, 10);
}

var code = [];

function createCode(unit, id, state){

    code = [];

    convertToPulses(unit, 5);

    convertToPulses(id, 5);

    addToCode(highPulse);

    convertToPulses(state);

    addToCode(endPulse);

    console.log(code);
}

function convertToPulses(number, length){
    var binary = dec2bin(number);

    if((binary.length - length) < 0){
        for(var i = 0; i > (binary.length - length); i--){
            addToCode(highPulse);
        }
    }

    for(var i = 0; i < binary.length; i++){
        if(binary[i] == 1){
            addToCode(lowPulse);
        }else{
            addToCode(highPulse);
        }
    }
}

function addToCode(pulse){
    pulse.forEach(function(value){
        code.push(value);
    });
}

function raspiUsleep(delayus){
    if(delayus > raspiUsdelay){
        sleep.usleep(code[x]-raspiUsdelay);
    }
}

function gpio433send(code, rawlen, repeats){
    for(var r = 0; r<repeats; r++){
        for(var x = 0; x<rawlen; x+=2){
            gpio433Out.writeSync(1);
            raspiUsleep(code[x]);
            gpio433Out.writeSync(0);
            if(x+1 < rawlen){
                raspiUsleep(code[x+1]);
            }
        }
        gpio433Out.writeSync(0);
    }
}

