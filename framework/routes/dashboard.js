var fs = require('fs');
var dashboardConfig = JSON.parse(fs.readFileSync(__dirname + "/../config/dashboard.json", "utf8"));

module.exports = function(app, io){
    //serve the dashboard
    app.get('/dashboard', Manager.manager('web').isAuthenticated, function(request, response) {
        webContent = Manager.manager('web').gatherContent();
        webContent['dashboard'] = dashboardConfig.dashboard;

        response.render('dashboard', webContent);    
    });
    
    io.sockets.on('connection', function(socket) {
      //socket.on('dashboard_load_items', function (message) {
    //      console.log('Received message: ' + message);
          //io.sockets.emit('dashboard_items', dashboardConfig.each();
      //});
    });
};