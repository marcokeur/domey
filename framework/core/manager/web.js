var util = require('util');
var EventEmitter = require('events').EventEmitter;

var express = require('express')
, app = express()
, http = require('http')
, server = http.createServer(app)
, jade = require('jade')
, io = require('socket.io').listen(server);

var webContent = {};

function Web() 
{
	EventEmitter.call(this);
}

module.exports = Web;

util.inherits(Web, EventEmitter);

Web.prototype.init = function(){
	console.log("Web init");
      
    
    app.set('views', __dirname + '/../../views');
    app.set('view engine', 'jade');
    
    // static file handling
    app.use(express.static(__dirname + '/../../public'));    
    
    app.get('/', function(request, response) {
            gatherContent();
    console.log(webContent);
        response.render('wrapper', webContent);
    });
    
    app.get('/login', function(request, response){
            gatherContent();

        response.render('login', webContent);
    });
    
    app.post('/login', function(request, response){
            gatherContent();

        response.redirect('/');
    });
        
    io.sockets.on('connection', function(socket) {
      socket.on('message', function (message) {
          console.log('Received message: ' + message);
          io.sockets.emit('pageview', { 'url': message });
      });
    });
    
    Manager.manager('drivers').on('realtime', function(msg){
        console.log('event! ' + msg);
        io.sockets.emit('realtime', msg);
    });
    

    server.listen(3000);

    
};

Web.prototype.registerThing = function(thing, meta){
    app.get('/' + thing, function(request, response){

        gatherContent();
        webContent['currentThing'] = {
            drivers : meta.drivers
        };
        
        for(var i in webContent.currentThing.drivers){
            webContent.currentThing['devices'] = Manager.manager('drivers').getDriver(webContent.currentThing.drivers[i].id).devices;
        }

        console.log(JSON.stringify(webContent.currentThing.devices));
        response.render(__dirname + '/../../views/thing.jade', webContent);
    });    
}

Web.prototype.registerApi = function(thing, file, callback){
    var api = require(file);
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

Web.prototype.registerPage = function(thing, file, uri, meta, callback){
    app.get(uri, function(request, response){

        gatherContent();
        webContent['currentThing'] = {
            drivers : meta.drivers
        };
        
        for(var i in webContent.currentThing.drivers){
            webContent.currentThing['devices'] = Manager.manager('drivers').getDriver(webContent.currentThing.drivers[i].id).devices;
        }

        response.render(file, webContent);
    });
}


function gatherContent(){
    webContent = {}
    var things = Manager.getThings();
    webContent.menu = [];
    for(var i in things){
        webContent.menu.push( 
            { 'humanName' : things[i].humanName,
              'uri' : things[i].uri    
            }
        );
    }    
}