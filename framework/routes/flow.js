module.exports = function(app) {

    app.get('/flow', function(request, response){
        webContent = gatherContent();
        webContent['flow'] = Manager.manager('flow').getItems();
        console.log(webContent);
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