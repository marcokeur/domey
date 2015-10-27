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

    Domey.manager('web').addApiCall('GET', 'scene', self.apiGetCollection, self.apiGetElement, self.apiGetRouter);

};

Scene.prototype.apiGetCollection = function(){
    var response = [];

    //set http response code
    response['status'] = 200;
    response['data'] = self.scenes;

    return response;
}

Scene.prototype.apiGetElement = function(element){
    var response = [];

    //find the specific flow
    for(var i in self.scenes){
        //if correct flow is found
        if(self.scenes[i].id == element){
            //set http response code
            response['status'] = 200;
            response['data'] = self.scenes[i];

            return response;
        }
    }

    response['status'] = 404;
    return response;
}

Scene.prototype.apiGetRouter = function(params){
    var element = params[1];
    var action = params[2];

    switch(action){
        case 'activate':
            return self.apiActivateScene(element);
            break;
        default:
            console.log('unknown action');
            break;
    }
}

Scene.prototype.apiActivateScene = function(id){
    var response = [];
    response['status'] = 404;

    for(i in self.scenes){
        if(self.scenes[i].id == id){
            self.emit('scene.set', i);
            response['status'] = 200;
            break;
        }
    }

    return response;
}

