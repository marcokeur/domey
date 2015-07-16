var fs = require('fs');

module.exports = function(app) {
    app.get('/log', Manager.manager('web').isAuthenticated, function(request, response){
        var content = Manager.manager('web').gatherContent();
        var logfile = fs.readFileSync(__dirname + "/../debug.log", "utf8");
        content['logfile'] = logfile;

        response.render('log', content);
    });
};