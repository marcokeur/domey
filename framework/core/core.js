var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var managerList = [];


function Manager(){
	EventEmitter.call(this);

	//init managers here
	//and put in list
}

module.exports = Manager;

util.inherits(Manager, EventEmitter);

Manager.prototype.init = function(){
	console.log('Manager - init');

    var drivers = require('./manager/drivers.js');
    managerList['drivers'] = new drivers();
    
    loadThings();
    /*
	requireManagers(this);
	console.log(ManagerList);
    for(var manager in ManagerList){
        console.log('Manager - registering ' + manager);
        ManagerList[manager].init();
    }
    */
};

Manager.prototype.manager = function ( type ){
	//get from list
	//and return
	if(ManagerList[type] == undefined){
		return ManagerList;
	}else{
		return ManagerList[type];
	}
}

Manager.prototype.log = function ( msg ){
	console.log("Manager.log: " + msg);
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

function loadThings(){
    fs.readdirSync(__dirname + '/../things/').forEach(function(thingName) {
       var meta = parseMeta(__dirname + '/../things/' + thingName + '/app.json'); 
        console.log(meta.dependencies);
        var depList = [];
        for(var dep in meta.dependencies){
            depList.push(dep);
        }
        installDependencies(depList, function(){
            //dependencies installed
            //lets load the drivers
            meta.drivers.forEach(function(driver){
  console.log(driver);              managerList['drivers'].loadDriver(thingName, driver.id);
            });
        });
    }); 
}

/*
function requireManagers(self){
    require('fs').readdirSync(__dirname + '/manager/').forEach(function(file) {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
        var name = file.replace('.js', '');
        var raw = require('./manager/' + file);
        ManagerList[name] = new raw();
        
        if(name == 'things'){
            ManagerList[name].on('ready', function(){
                self.emit('ready');
            });
        }
      }
    });
}

function registerThings(self, callback){
    require('fs').readdirSync(__dirname + '/../../things').forEach(function(thing, index, array) {
        console.log('Things - registering thing: ' + thing);
        
        var depList = [];
        
        var app_json = JSON.parse(require('fs').readFileSync(__dirname + '/../../things/' + thing + '/app.json', 'utf-8'));
        for(var dep in app_json.dependencies){
            depList.push(dep);   
        }

        if(depList.length > 0){
            installDependencies(depList, thing, function(thing){
                if(require('fs').existsSync(__dirname + '/../../things/' + thing + '/app.js')){
                    var raw = require(__dirname + '/../../things/' + thing + '/app.js');
                    thingsList[thing] = new raw();
                }
                console.log('things.done for ' + thing);

                if (index === array.length - 1) {
                    console.log('all things done');
                    callback(self);
                }
            });
        }else{
                if (index === array.length - 1) {
                    console.log('all things done');
                    callback(self);
                }
        }
    });
}


*/