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
};

Scene.prototype.init = function () {
    
    console.log("scene mamanger - init");

    self = this;

    self.scenes = Domey.getConfig('scenes');



    Domey.manager('web').addApiCall('GET', 'scene', self.apiGetCollection, self.apiGetElement, self.apiGetRouter);

};

Scene.prototype.apiGetCollection = function(){
    var response = [];

    //set http response code
    response['status'] = 200;
    response['data'] = self.scenes;

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
            response['data'] = self.scenes[i];

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
        default:
            console.log('unknown action');
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

function activateScene(scene) {
    console.log('bla ' + JSON.stringify(scene.enable));
    for (var i in scene.enable.things) {
        console.log('action.' + scene.enable.things[i].method);
        self.emit('action.' + scene.enable.things[i].method, scene.enable.things[i].args, function (response) {
            console.log('action emitted for scene!: ' + response);
        });
    }

}

