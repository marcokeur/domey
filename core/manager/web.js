var util = require('util');
var EventEmitter = require('events').EventEmitter;

var express = require('express')
, app = express()
, http = require('http').Server(app)
, io = require('socket.io')(http)
, jade = require('jade');

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

    /* print all known api calls */
    app.all('/api', function(request, response){
        for(var i in apiItems){
            if(apiItems[i].collection != undefined)
                response.write(apiItems[i].method + ' /api/' + apiItems[i].collection + '/\n');

            if(apiItems[i].elementFunction != undefined)
                response.write(apiItems[i].method + ' /api/' + apiItems[i].collection + '/:elementId\n');

            if(apiItems[i].routerFunction != undefined)
                response.write(apiItems[i].method + ' /api/' + apiItems[i].collection + '/:elementId/:routerCall\n');

        }

        response.end();
    })

    /* add handler for api */
    app.all('/api/*', function(request, response){
        var params = request.params[0].split('/');
        var httpMethod = request.method;
        var collection = params[0];
        var element = params[1];

        for(var i in apiItems){
            if((apiItems[i].method == httpMethod) && (apiItems[i].collection == collection)){

                //if no element is defined, call collectionF
                if(params[1] == undefined || params[1].length == 0){
                    apiItems[i].collectionFunction(apiCallback, response);
                }else if(params[2] == undefined || params[2].length == 0){
                    apiItems[i].elementFunction(element, apiCallback, response);
                }else if(apiItems[i].routerFunction != undefined){
                    apiItems[i].routerFunction(params, apiCallback, response);
                }
                break;
            }
        }
    });

    io.on('connection', function(socket){
        console.log('a user connected');
    });

    Domey.on('capabilityUpdated', function(data){
        io.emit('capabilityUpdated', data);
    });

    http.listen(3000);
};

function apiCallback(data, response){
    if(data != undefined){
        response.writeHead(data.status, {"Content-Type": "application/json"});
        response.end(JSON.stringify({'response' : data.data}));
    }else{
        response.status(404).end();
    }
}

//register to api: METHOD, collection, function for collection, function for element
Web.prototype.addApiCall = function(method, collection, collectionFunction, elementFunction, routerFunction) {
    var item = new ApiItem(method, collection, collectionFunction, elementFunction, routerFunction);
    apiItems.push(item);
}

function ApiItem(method, collection, collectionFunction, elementFunction, routerFunction) {
    this.method = method;
    this.collection = collection;
    this.collectionFunction = collectionFunction;
    this.elementFunction = elementFunction;
    this.routerFunction = routerFunction;
}

