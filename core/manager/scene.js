var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

function Scene() {
	EventEmitter.call(this);
}

module.exports = Scene;

util.inherits(Scene, EventEmitter);

var scenes;
var activeSceneId;

var self;

Scene.prototype.getName = function(){
    return 'scene';
};

Scene.prototype.init = function () {
    self = this;

    self.scenes = Domey.getConfig('scenes');

    self.activeSceneId = 0;

    Domey.manager('web').addApiCall('GET', 'scene', self.apiGetCollection, self.apiGetElement, self.apiGetRouter);

};

Scene.prototype.apiGetCollection = function(cb, handler){
    var response = [];

    //set http response code
    response['status'] = 200;
    response['data'] = {
        'scenes' : JSON.parse(JSON.stringify(self.scenes))
    }

    for(var i in response['data'].scenes){
        if(response['data'].scenes[i].id == activeSceneId){
            response['data'].scenes[i].active = true;
        }else{
            response['data'].scenes[i].active = false;
        }
    }

    cb(response, handler);
};

Scene.prototype.apiGetElement = function(element, cb, handler){
    var response = [];

    //find the specific flow
    for(var i in self.scenes){
        //if correct flow is found
        if(self.scenes[i].id == element){
            //set http response code
            response['status'] = 200;
            response['data'] = JSON.parse(JSON.stringify(self.scenes[i]));

            if(response['data'].id == activeSceneId){
                response['data'].active == true;
            }

            cb(response, handler);
            return;
        }
    }

    response['status'] = 404;
    cb(response, handler);
    return;
};

Scene.prototype.apiGetRouter = function(params, cb, handler){
    var element = params[1];
    var action = params[2];

    switch(action){
        case 'activate':
            cb(self.apiActivateScene(element), handler);
            break;
        case 'deactivate':
            cb(self.apiDeactivateScene(element), handler);
            break;
        default:
            cb(undefined, handler);
            break;
    }
};

Scene.prototype.apiActivateScene = function(id){
    var response = [];
    response['status'] = 404;

    for(i in self.scenes){
        if(self.scenes[i].id == id){
            activateScene(self.scenes[i]);
            response['status'] = 200;
            break;
        }
    }

    return response;
};

Scene.prototype.apiDeactivateScene = function(id){
    var response = [];
    response['status'] = 404;

    for(i in self.scenes){
        if(self.scenes[i].id == id){
            deactivateScene(self.scenes[i]);
            response['status'] = 200;
            break;
        }
    }

    return response;
};

function activateScene(scene) {
    //if there is a scene active
    if(activeSceneId > 0){
        //deactivate first
        for(i in self.scenes){
            if(self.scenes[i].id == activeSceneId){
                deactivateScene(self.scenes[i]);
            }
        }
    }

    //set the new scene as active
    activeSceneId = scene.id;

    for (var i in scene.enable) {
        Domey.triggerAction(scene.enable[i].action, scene.enable[i].args);
    }
}

function deactivateScene(scene){
    for (var i in scene.enable) {
        Domey.triggerAction(scene.disable[i].action, scene.disable[i].args);
    }

    activeSceneId = 0;
}

