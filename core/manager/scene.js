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
    
    console.log("scene mamanger - init");

    self = this;

    self.scenes = Domey.getConfig('scenes');

    self.activeSceneId = 0;

    Domey.manager('web').addApiCall('GET', 'scene', self.apiGetCollection, self.apiGetElement, self.apiGetRouter);

};

Scene.prototype.apiGetCollection = function(){
    var response = [];

    //set http response code
    response['status'] = 200;
    response['data'] = JSON.parse(JSON.stringify(self.scenes));

    if(activeSceneId > 0){
        for(var i in response['data']){
            if(response['data'][i].id == activeSceneId){
                response['data'][i].active = true;
                console.log(activeSceneId);
            }
        }
    }
    return response;
};

Scene.prototype.apiGetElement = function(element){
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

            return response;
        }
    }

    response['status'] = 404;
    return response;
};

Scene.prototype.apiGetRouter = function(params){
    var element = params[1];
    var action = params[2];

    switch(action){
        case 'activate':
            return self.apiActivateScene(element);
            break;
        case 'deactivate':
            return self.apiDeactivateScene(element);
            break;
        default:
            console.log('unknown action: ' + action);
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
        console.log('action.' + scene.enable[i].action);
        Domey.triggerAction(scene.enable[i].action, scene.enable[i].args);
    }
}

function deactivateScene(scene){
    for (var i in scene.enable) {
        console.log('action.' + scene.disable[i].action);
        Domey.triggerAction(scene.disable[i].action, scene.disable[i].args);
    }

    activeSceneId = 0;
}

