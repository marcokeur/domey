var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

var express = require('express')
, app = express()
, http = require('http')
, server = http.createServer(app)
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
        console.log(JSON.stringify(apiItems));
        var params = request.params[0].split('/');
        var httpMethod = request.method;
        var collection = params[0];
        var element = params[1];

        for(var i in apiItems){
            if((apiItems[i].method == httpMethod) && (apiItems[i].collection == collection)){
                var data;

                //if no element is defined, call collectionF
                if(params[1] == undefined || params[1].length == 0){
                    data = apiItems[i].collectionFunction();
                }else if(params[2] == undefined || params[2].length == 0){
                    data = apiItems[i].elementFunction(element);
                }else if(apiItems[i].routerFunction != undefined){
                    data = apiItems[i].routerFunction(params);
                }

                if(data != undefined){
                    console.log(data);
                    response.writeHead(data.status, {"Content-Type": "application/json"});
                    response.end(JSON.stringify({'response' : data.data}));
                    break;
                }else{
                    response.status(404).end();
                }
            }
        }
    });

    server.listen(3000);
};

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