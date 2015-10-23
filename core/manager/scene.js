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

    Domey.manager('web').addApiCall('GET', 'scene', 'set', self.setScene);
    Domey.manager('web').addApiCall('GET', 'scene', 'get', self.getScene);
    Domey.manager('web').addApiCall('GET', 'scene', 'activate', self.activateScene);

};

//RETURN FOR JADE
Scene.prototype.getDashboardContent = function(){
    return self.scenes;
}

//API STUFF CRUD
/* get the scene object from id */
Scene.prototype.getScene = function(params){
    var id = params[2];

    for(var i in self.scenes){
        if(self.scenes[i].id == id){
            return self.scenes[i];
        }
    }

    return self.scenes;
}

/* set the scene object by id */
Scene.prototype.setScene = function(id){
    for(i in self.scenes){
        if(self.scenes[i].id == id){
            self.emit('scene.set', i);
            return 'ok';
        }
    }

    return 'nok';
}

Scene.prototype.activateScene = function(params){
    var id = params[2];

    for(i in self.scenes){
        if(self.scenes[i].id == id){
            self.emit('scene.set', i);
            return 'ok';
        }
    }

    return 'nok';
}

