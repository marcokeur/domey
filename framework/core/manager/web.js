var express = require('express');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
require('jade');
var app

var webContent = {};

function Web() 
{
	EventEmitter.call(this);
}

module.exports = Web;

util.inherits(Web, EventEmitter);

Web.prototype.init = function(){
	console.log("Web init");
    
    webContent['things'] = Manager.getThings()
   
    app = express();
    
    app.set('views', __dirname + '/../../views');
    app.set('view engine', 'jade');
    

    // static file handling
    app.use(express.static(__dirname + '/../../public'));    
    
    app.get('/', function(request, response) {
        response.render('wrapper', webContent);
    });
    
    app.get('/login', function(request, response){
        response.render('login', webContent);
    });
    
    app.post('/login', function(request, response){
        response.redirect('/');
    });
        

    app.listen(3000);
};

Web.prototype.registerApi = function(thing, file, callback){
    console.log(file);
    var api = require(file);
    console.log(api);
    api.forEach(function(call){
        console.log('registering call: ' + call.description + ' for thing ' + thing);
        if(call.method == 'GET'){
            app.get('/api/' + thing + call.path + '/:device', function(request, response){
                var driver = Manager.manager('drivers').getDriver(call.driver);
                var device = driver.getDevice(request.params.device);

                call.fn(driver, device, function(){
                    console.log('api callback');
                    response.json(driver.getStatus(device));
                });   
            });
        }else if(call.method == 'POST'){
            app.post('/api/' + thing + call.path + '/:device', function(request, response){
                var driver = Manager.manager('drivers').getDriver(call.driver);
                var device = driver.getDevice(request.params.device);

                call.fn(driver, device, function(){
                    console.log('api callback');
                    response.json({ message: 'ok'});
                });    
            });            
        }
    });
}

Web.prototype.registerPage = function(thing, file, uri, callback){
    app.get(uri, function(request, response){
        console.log('sending ' + file);
        //response.json(file);
        response.render(file, webContent);
    });
}
