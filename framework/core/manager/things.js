"use strict";
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var thingsList = [];
  
function Things() 
{
	EventEmitter.call(this);
}

module.exports = Things;

util.inherits(Things, EventEmitter);

Things.prototype.init = function(){
	console.log("Things - init");

//    registerThings(this, function(self){
//        console.log('Things - ready');
//        self.emit('ready');
//    });
};

Things.prototype.thing = function(name){
    if(thingsList[name] === undefined){
        return thingsList;
    }else{
        return thingsList[name];
    }
}

function registerThings(self, callback){
    require('fs').readdirSync(__dirname + '/../../things').forEach(function(thing, index, array) {
        console.log('Things - registering thing: ' + thing);
        
        var depList = [];
        
        var app_json = JSON.parse(require('fs').readFileSync(__dirname + '/../../things/' + thing + '/app.json', 'utf-8'));
        for(var dep in app_json.dependencies){
            depList.push(dep);   
        }

        if(depList.length > 0){
            installDependencies(depList, thing, function(thing){
                if(require('fs').existsSync(__dirname + '/../../things/' + thing + '/app.js')){
                    var raw = require(__dirname + '/../../things/' + thing + '/app.js');
                    thingsList[thing] = new raw();
                }
                console.log('things.done for ' + thing);

                if (index === array.length - 1) {
                    console.log('all things done');
                    callback(self);
                }
            });
        }else{
                if (index === array.length - 1) {
                    console.log('all things done');
                    callback(self);
                }
        }
    });
}

function installDependencies( dependencies, thing, callback ){
    var npm = require("npm");
    npm.load(function (err) {
      // catch errors
      npm.commands.install(dependencies, function (er, data) {
        // log the error or data
          console.log('npm install done');
          callback(thing);
      });
      npm.on("log", function (message) {
        // log the progress of the installation
        //console.log(message);
      });
    });   
}
