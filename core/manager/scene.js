var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

function Scene() {
	EventEmitter.call(this);
}

module.exports = Scene;

util.inherits(Scene, EventEmitter);

var scenes;

var self;

Scene.prototype.getName = function(){
    return 'scene';   
}

Scene.prototype.init = function () {
    
    console.log("scene mamanger - init");

    self = this;

    self.scenes = Domey.getConfig('scenes');

    self.on('scene.set', function(sceneId){
        for(var i in self.scenes[sceneId].things){
            self.emit('action.' + self.scenes[sceneId].things[i].method, self.scenes[sceneId].things[i].args, function(response){
                    console.log('action emitted for scene!');
            });
        }
    });

    Domey.manager('web').addApiCall('scene', 'set', self.setScene);
    Domey.manager('web').addApiCall('scene', 'get', self.getScene);

};

Scene.prototype.getScene = function(id){

    console.log(self.scenes);

    for(var i in self.scenes){
        if(self.scenes[i].id == id){
            return JSON.stringify(self.scenes[i]);
        }
    }

    console.log(self.scenes);

    return JSON.stringify(self.scenes);
}

Scene.prototype.setScene = function(id){
    for(i in self.scenes){
        if(self.scenes[i].id == id){
            self.emit('scene.set', i);
            return 'ok';
        }
    }

    return 'nok';
}
