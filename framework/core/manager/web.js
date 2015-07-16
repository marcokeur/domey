var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

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

var users = {}

function Web() 
{
	EventEmitter.call(this);
}

module.exports = Web;

util.inherits(Web, EventEmitter);

Web.prototype.init = function(){
	console.log("Web manager - init");
      
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
        users = JSON.parse(fs.readFileSync(__dirname + '/../../config/users.json', 'utf8')).users;
        
        for(i in users){
            if(users[i].username == username && users[i].password == password){
                return done(null, users[i]);
            }
        }
        
        //if no match has been found
        return done(null, false, req.flash('error', 'Invalid credentials'));  
    }));
    
    //auth
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(expressSession({secret: 'mySecretKey',
                            resave: true,
                            saveUninitialized: true}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    
    // static file handling
    app.use(express.static(__dirname + '/../../public'));    

    //load routes from dir
    require(__dirname + '/../../routes')(app, io, passport);
        
    Manager.on('all_things_registered',function(things){
        //add handles to the things api's
        for(i in things){

            var apiPath = __dirname + '/../../things/' + things[i].name + '/api.js';
            fs.existsSync(apiPath, function(err, rd){
                console.log(err);
                if(err == null){
                    //api get calls
                    app.use('/api/' + things[i].name, require(apiPath));
                }
            });
        }
        
        //404 error
        app.use(function(request, response){
            res.render('404.jade');
        });
    });
    
    Manager.manager('drivers').on('realtime', function(msg){
        io.sockets.emit('realtime', msg);
    });
    
    server.listen(3000);    
};



/*
Web.prototype.registerPage = function(thing, file, uri, meta, callback){
    app.get(uri, function(request, response){

        webContent = this.gatherContent();
        webContent['currentThing'] = {
            drivers : meta.drivers
        };
        
        for(var i in webContent.currentThing.drivers){
            webContent.currentThing['devices'] = Manager.manager('drivers').getDriver(webContent.currentThing.drivers[i].id).devices;
        }

        response.render(file, webContent);
    });
}

*/


