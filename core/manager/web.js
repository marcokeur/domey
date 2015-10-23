var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

var express = require('express')
, app = express()
, http = require('http')
, server = http.createServer(app)
, jade = require('jade')
, io = require('socket.io').listen(server);

var users = {}

var apiItems = [];

function Web() 
{
	EventEmitter.call(this);
}

module.exports = Web;

util.inherits(Web, EventEmitter);

Web.prototype.getName = function(){
    return 'web';   
}

Web.prototype.init = function(){
	console.log("Web manager - init");
      
    app.set('views', __dirname + '/../../views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;

    // static file handling
    app.use(express.static(__dirname + '/../../public'));

    //load routes from dir
    require(__dirname + '/../../routes')(app);

    /* add handler for api */
    app.all('/api/*', function(request, response){
        console.log(JSON.stringify(apiItems));
        var params = request.params[0].split('/');
        var m = params[0];
        var f = params[1];

        for(var i in apiItems){
            if((apiItems[i].module == m) && (apiItems[i].func == f) && (apiItems[i].type == request.method)){
                var data = apiItems[i].call(params);

                response.writeHead(200, {"Content-Type": "application/json"});
                response.end(JSON.stringify({'response' : data}));
            }
        }
        response.status(404).end();
    });

    Domey.manager('drivers').on('realtime', function(msg){
        io.sockets.emit('realtime', msg);
    });

    server.listen(3000);    
};

Web.prototype.addApiCall = function(type, module, func, call) {
    var item = new ApiItem(type, module, func, call);
    apiItems.push(item);
}

function ApiItem(type, module, func, call) {
    this.type = type;
    this.module = module;
    this.func = func;
    this.call = call;
}