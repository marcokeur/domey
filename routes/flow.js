module.exports = function(app) {

    app.get('/flow', isAuthenticated, function(request, response){
        webContent = gatherContent();
        webContent['flowitems'] = Domey.manager('flow').getItems();
        webContent['flows'] = Domey.manager('flow').getFlows();
        
        console.log(JSON.stringify(webContent['flows']));
        response.render(__dirname + '/../views/flow.jade', webContent);
    });

    app.post('/api/flow/action/call/:id', function(request, response){
    //app.post('/api/flow/item/call/:id', isRestAuthenticated, function(request, response){
        var item = Domey.manager('flow').getFlowItemById(request.params.id);
        var args = request.body.args[0];

        Domey.manager('flow').callItem(item.type, item.meta, args, function(flowResponse){
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(JSON.stringify({'response' : flowResponse}));
        });
    });

    app.post('/api/flow/condition/call/:id', function(request, response){
        //app.post('/api/flow/item/call/:id', isRestAuthenticated, function(request, response){
        var item = Domey.manager('flow').getFlowItemById(request.params.id);
        var args = request.body.args[0];

        Domey.manager('flow').callItem(item.type, item.meta, args, function(flowResponse){
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(JSON.stringify({'response' : flowResponse}));
        });
    });

    app.post('/api/flow/trigger/call/:id', function(request, response){
        //app.post('/api/flow/item/call/:id', isRestAuthenticated, function(request, response){
        var item = Domey.manager('flow').getFlowItemById(request.params.id);
        var args = request.body.args[0];

        if(item.type == 'trigger'){
            //emit a flow trigger
            Domey.manager('flow').trigger(item.meta.method, args);
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(JSON.stringify({'response' : 'ok'}));
        }
    });
}

// As with any middleware it is quintessential to call next()
// if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

function isRestAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.send(401);
}

function gatherContent(){
    webContent = {}
    var things = Domey.getThings();
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

function getFlowItemByMethod(method){
    for(i in Domey.manager('flow').getItems()){
        if(flowItems[i].meta.method == method){
            return flowItems[i];   
        }
    }
}