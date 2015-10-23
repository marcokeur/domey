var fs = require('fs');
var dashboardConfig = JSON.parse(fs.readFileSync(__dirname + "/../config/dashboard.json", "utf8"));

module.exports = function(app){
    //serve the dashboard
    app.get('/dashboard', function(request, response) {
        response.redirect('/dashboard/scenes');
    });

    app.get('/dashboard/scenes', function(request, response){
        //var webContent = [];
        //webContent['scenes'] = Domey.manager('scene').getDashboardContent();
        response.render('dashboard_scenes');
    });
};