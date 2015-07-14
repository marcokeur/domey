var fs = require('fs');
var dashboardConfig = JSON.parse(fs.readFileSync(__dirname + "/../config/dashboard.json", "utf8"));

module.exports = function(app, io){
    //serve the dashboard
    app.get('/dashboard', function(request, response) {
        webContent = gatherContent();
        webContent['dashboard'] = dashboardConfig.dashboard;

        console.log(JSON.stringify(webContent));
        response.render('dashboard', webContent);    
    });
    
    io.sockets.on('connection', function(socket) {
      //socket.on('dashboard_load_items', function (message) {
    //      console.log('Received message: ' + message);
          //io.sockets.emit('dashboard_items', dashboardConfig.each();
      //});
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