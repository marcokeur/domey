var util = require('util');
var EventEmitter = require('events').EventEmitter;
var gpio = require('rpi-gpio');
var fs = require('fs');
var platformInfo;
//interface config
var config;

function rpi_gpio() 
{
    EventEmitter.call(this);
}

module.exports = rpi_gpio;

util.inherits(rpi_gpio, EventEmitter);


rpi_gpio.prototype.getName = function(){
    return 'rpi_gpio';   
}

rpi_gpio.prototype.init = function(){
	console.log("rpi_gpio init");
    
    var self = this;
    getPlatform(function(platformInfo){
        if(isRaspberry(platformInfo)){
            gpio.on('change', function(channel, value) {
                console.log('Channel ' + channel + ' value is now ' + value);
                self.emit('change', {'pin' : channel, 'value': value});
            });

            config = Domey.getConfig('interfaces', 'rpi_gpio');

            for(var i in config.pins){
                var pin = config.pins[i];   

                if(pin.direction == 'input'){
                    gpio.setup(pin.number, gpio.DIR_IN);
                }else if(pin.direction == 'output'){
                    gpio.setup(pin.number, gpio.DIR_OUT);
                }
            }
        }else{
            console.log('Not running on Raspberry Pi, GPIO is not available!');   
        }
    });    
};

rpi_gpio.prototype.setPin = function(pin, value, callback){
    if(isRaspberry(platformInfo)){
        for(var i in config.pins){
            if(pin == config.pins[i].number){
                gpio.write(config.pins[i].number, value, function(err){
                    callback(err);
                });
            }
        }
    }else{
        err = 'Not running on Raspberry Pi, GPIO is not available!';
        callback(err);
    }
}

rpi_gpio.prototype.getPin = function(pin, value, callback){
    if(isRaspberry(platformInfo)){
        for(var i in config.pins){
            if(pin == config.pins[i].number){
                gpio.read(config.pins[i].number, function(err, value){
                        callback(err, value);
                });
            }
        }
    }else{
        err = 'Not running on Raspberry Pi, GPIO is not available!';
        callback(err);
    }
}

function getPlatform(callback){
    var platformInfo;

    fs.readFile('/proc/cpuinfo', 'utf8', function(err, data) {
        if(!err){
            //data = 'Hardware	: BCM2709';
            match = new RegExp(/(Hardware).*?(BCM270\d)/g).exec(data);
            if(match){
                console.log(JSON.stringify(match));
                if(match[2] == 'BCM2708'){
                    //raspi v1
                    platformInfo = { SoC : match[2], version: 1 }
                }else if(match[2] == 'BCM2709'){
                    //raspi v2
                    platformInfo = { SoC : match[2], version: 2 }
                }
            }else{
                    //no raspi / other soc
                    platformInfo = { SoC : 'unknown', version: 'unknown' }
            }
            
            callback(platformInfo);
        }
    });
}

function isRaspberry(platform){
    console.log(platform);
    if(platform.SoC != 'BCM2708' && platform.SoC != 'BCM2709'){
        return false;
    }else{
        return true;
    }
}