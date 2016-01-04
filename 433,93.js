var sleep = require('sleep');
var kaku = require('./kaku.js');

console.log(kaku.createCode());

var Gpio = require('onoff').Gpio;  // Constructor function for Gpio objects.
//var gpio433In = new Gpio(4, 'in', 'both'); // Export GPIO #4 as an interrupt
var gpio433Out = new Gpio(5, 'out');

console.log('Please press the button on GPIO #4...');

// The callback passed to watch will be called when the button on GPIO #4 is
// pressed. 
button.watch(function (err, value) {
  if (err) {
    throw err;
  }

  console.log('interrupt ' + value);

  //button.unexport(); // Unexport GPIO and free resources
});

function gpio433send(code, rawlen, repeats){
    for(var r = 0; r<repeats; r++){
        for(var x = 0; x<rawlen; x+=2){
            gpio433Out.writeSync(1);
            sleep.usleep(code[x]);
            gpio433Out.writeSync(0);
            if(x+1 < rawlen){
                sleep.usleep(code[x+1]);
            }
        }
        gpio433Out.writeSync(0);
    }
}

