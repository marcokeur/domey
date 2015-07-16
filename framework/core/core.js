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
    
    var persistence = require('./manager/persistence.js');
    managerList['persistence'] = new persistence();
    
    var flow = require('./manager/flow.js');
    managerList['flow'] = new flow();
    
    this.on('thing_registered', function(thing){
        //check if all items have been loaded
        if(things.length == fs.readdirSync(__dirname + '/../things/').length) {
            //if so, emit the all things registered event
            this.emit('all_things_registered', things); 
            console.log('all things registered!');
            
                this.emit('testflow');

        }    
    });
}

module.exports = Manager;

util.inherits(Manager, EventEmitter);

Manager.prototype.init = function(){
	console.log('Framework - init');

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

Manager.prototype.getThings = function(){
    return things;   
}

Manager.prototype.getThing = function(thingName){
    for(i in things){
        if(things[i].name == thingName){
            return things[i];
        }
    }
}

function loadJSON(file){
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function installDependencies( dependencies, callback ){
    var depList = [];
    for(var dep in dependencies){
        depList.push(dep);
    }

    var npm = require("npm");
    npm.load(function (err) {
        // catch errors
        npm.commands.install(depList, function (er, data) {
            // log the error or data
            console.log('npm install done');
            callback();
        });
        npm.on("log", function (message) {
            // log the progress of the installation
            console.log(message);
        });
    });   
}

function Thing(name, humanName, uri, meta, obj){
    this.name = name;
    this.humanName = humanName;
    this.uri = uri;
    this.meta = meta;
    this.obj = obj;
}

var loadedDrivers = [];


function loadThings(self){
    var installedThingsFile = __dirname + '/../config/installed_things.json';
    var installedThings = loadJSON(installedThingsFile);
    
    //for each thing in dir
    fs.readdirSync(__dirname + '/../things/').forEach(function(thingName, index, array) {
        //load the metadata
        var meta = loadJSON(__dirname + '/../things/' + thingName + '/app.json'); 
        
        //check if the thing already has been installed
        if(installedThings.indexOf(meta.id) == -1){
            console.log('Unknown thing, lets installed dependencies');
            //if not, install dependencies
                installDependencies(meta.dependencies, function(){
                    //dependencies installed
                    installedThings.push(meta.id);
                    
                    //write to file    
                    fs.writeFileSync(installedThingsFile, JSON.stringify(installedThings));
                    
                    //lets load the drivers
                    loadThing(self, meta);
                });
        }else{
            //we know this one already, just load it
            loadThing(self, meta);
        }
    }); 
}

function loadThing(self,meta){
    //instantiate the thing
    var obj = require(__dirname + '/../things/' + meta.id + '/app.js');
    var inst = new obj();
    inst.init();
    //add the 'thing' to the list for menu
    thing = new Thing(meta.id, meta.name.en, '/things/' + meta.id, meta, inst);
    things.push(thing);
    
    //emit that this thing has been loaded
    self.emit('thing_registered', thing); 
    console.log('Thing ' + meta.id + ' registered');
}

