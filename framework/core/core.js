var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var managerList = [];
var things = [];

function Manager(){
	EventEmitter.call(this);

	//init managers here
	//and put in list
    var drivers = require('./manager/drivers.js');
    managerList['drivers'] = new drivers();
    
    var web = require('./manager/web.js');
    managerList['web'] = new web();
}

module.exports = Manager;

util.inherits(Manager, EventEmitter);

Manager.prototype.init = function(){
	console.log('Manager - init');

    for(var manager in managerList)
        managerList[manager].init();
    
    loadThings(this);
};

Manager.prototype.manager = function ( type ){
	//get from list
	//and return
	if(managerList[type] == undefined){
		return managerList;
	}else{
		return managerList[type];
	}
}

Manager.prototype.log = function ( msg ){
	console.log("Manager.log: " + msg);
}

Manager.prototype.getThings = function(){
    return things;   
}

function parseMeta(file){
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function installDependencies( dependencies, callback ){
    var npm = require("npm");
    npm.load(function (err) {
      // catch errors
      npm.commands.install(dependencies, function (er, data) {
        // log the error or data
          console.log('npm install done');
          callback();
      });
      npm.on("log", function (message) {
        // log the progress of the installation
        //console.log(message);
      });
    });   
}

function Thing(name, humanName, uri){
    this.name = name;
    this.humanName = humanName;
    this.uri = uri;
}

var loadedDrivers = [];


function loadThings(self){
    fs.readdirSync(__dirname + '/../things/').forEach(function(thingName) {
       var meta = parseMeta(__dirname + '/../things/' + thingName + '/app.json'); 
        console.log(meta);
        var depList = [];
        for(var dep in meta.dependencies){
            depList.push(dep);
        }
        installDependencies(depList, function(){
            //dependencies installed
            //lets load the drivers
            meta.drivers.forEach(function(driver){
                console.log('driver: ' + driver + ' thingname -> ' + thingName);
                managerList['drivers'].loadDriver(thingName, driver.id, function(){
                    
                    loadedDrivers.push(driver.id);
                    if(loadedDrivers.length == 2){
                        self.emit('ready');    
                    }
                });
            });
        });
        
        fs.exists(__dirname + '/../things/' + thingName + '/api.js', function(){
            managerList['web'].registerApi(thingName, __dirname + '/../things/' + thingName + '/api.js', function(){
                console.log('api registered');
            });
        });
        
        if(meta.configPage !== undefined){
            //register a handle to page
            managerList['web'].registerPage(thingName, __dirname + '/../things/' + thingName + '/' + meta.configPage, '/' + thingName + '/' + meta.configPage, function(){
                console.log('page registered');
            });
            
            //add the 'thing' to the list for menu
            things.push(new Thing(thingName, meta.name.en, '/' + thingName + '/' + meta.configPage));

        }
    }); 
}

