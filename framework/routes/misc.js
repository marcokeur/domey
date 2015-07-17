var fs = require('fs');

module.exports = function(app) {
    app.get('/', isAuthenticated, function(request, response) {
        response.redirect('/dashboard');
    });
    
    app.get('/log', isAuthenticated, function(request, response){
        var content = gatherContent();
        var logfile = fs.readFileSync(__dirname + "/../debug.log", "utf8");
        content['logfile'] = logfile;

        response.render('log', content);
    });
};

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

// As with any middleware it is quintessential to call next()
// if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}