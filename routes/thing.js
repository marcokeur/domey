module.exports = function(app) {

    //render a thing's startpage
    app.get('/things/:thing', function(request, response){

        var thing = Domey.getThing(request.params.thing);

        //check if this thing is loaded
        if(thing === undefined){
            response.render('404.jade');
        }else{
            webContent = gatherContent();
            webContent['currentThing'] = {
                humanName: thing.meta.name.en,
                desc: thing.meta.description,
                drivers : thing.meta.drivers
            };

            for(var i in thing.meta.drivers){
                //console.log('devices : ' + JSON.stringify(Domey.manager('drivers').getDriver(thing.meta.drivers[i].id)));
                webContent.currentThing['devices'] = Domey.manager('drivers').getDriver(thing.meta.drivers[i].id).devices;
            }

            webContent['flowitems'] = Domey.manager('flow').getFlowItemsByThing(thing.meta.id);

            console.log("webContent %j", webContent);

            response.render(__dirname + '/../views/thing.jade', webContent);
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