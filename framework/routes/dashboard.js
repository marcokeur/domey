var fs = require('fs');
var dashboardConfig = JSON.parse(fs.readFileSync(__dirname + "/../config/dashboard.json", "utf8"));

module.exports = function(app, io){
    //serve the dashboard
    app.get('/dashboard', isAuthenticated, function(request, response) {
        webContent = gatherContent();
        webContent['dashboard'] = dashboardConfig.dashboard;

        response.render('dashboard', webContent);    
    });
};

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
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}