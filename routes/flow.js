module.exports = function(app) {

    app.get('/flow', isAuthenticated, function(request, response){
        webContent = gatherContent();
        webContent['flowitems'] = Domey.manager('flow').getItems();
        webContent['flows'] = Domey.manager('flow').getFlows();
        
        console.log(JSON.stringify(webContent['flows']));
        response.render(__dirname + '/../views/flow.jade', webContent);
    });
}

// As with any middleware it is quintessential to call next()
// if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
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