var fs = require('fs');

module.exports = function(app) {
    app.get('/log', function(request, response){
        var content = gatherContent();
        var logfile = fs.readFileSync(__dirname + "/../debug.log", "utf8");
        content['logfile'] = logfile;

        response.render('log', content);
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