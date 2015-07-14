var util = require('util');
var EventEmitter = require('events').EventEmitter;

var express = require('express')
, app = express()
, http = require('http')
, server = http.createServer(app)
, jade = require('jade')
, io = require('socket.io').listen(server)
, passport = require('passport')
, localStrategy = require('passport-local')
, flash = require('connect-flash')
, expressSession = require('express-session')
, bodyParser = require('body-parser');


var users = [
        { username: 'marco' },
        { username: 'marko' }
    ];



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
    
    passport.serializeUser(function(user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function(id, done) {
        for(user in users){
            if(users[user].username == id){
                done(null, user);
            }
        }
    });
    
    passport.use('login', new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback : true
      },
      function(req, username, password, done) {
        console.log('username' + username);
        if(username == 'marco'){
            var user = {
                username: 'marco'
            }
            return done(null, user);
        }else{
            return done(null, false, 
                req.flash('message', 'User Not found.'));  
        }
    }));
    
    //auth
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(expressSession({secret: 'mySecretKey'}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    
    // static file handling
    app.use(express.static(__dirname + '/../../public'));    

    //load routes from dir
    require(__dirname + '/../../routes')(app, io, passport);
    
    app.get('/', isAuthenticated, function(request, response) {
        response.redirect('/dashboard');
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
            humanName: meta.name.en,
            desc: meta.description,
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
    
    return webContent;
}

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}