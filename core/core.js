var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var managers = [];
var interfaces = [];
var things = [];

function Domey(){
	EventEmitter.call(this);
    
    var self = this;
    
    //load all managers
    getJSFilesInPath('core/manager').forEach(function(manager){
        managerInst = getInstanceFromFile(manager);
        managers[managerInst.getName()] = managerInst;
    });
    
    //load all interfaces
    getJSFilesInPath('core/interface').forEach(function(interface){
        interfaceInst = getInstanceFromFile(interface);
        interfaces[interfaceInst.getName()] = interfaceInst;
    });
    
    this.on('thing_registered', function(thing){
        //check if all items have been loaded
        if(things.length == fs.readdirSync(__dirname + '/../things/').length) {
            setTimeout(function(){
                //if so, emit the all things registered event
                self.emit('all_things_registered', things); 
                console.log('all things registered!');
            }, 2000);
        }    
    });
}

module.exports = Domey;

util.inherits(Domey, EventEmitter);

Domey.prototype.init = function(){
	console.log('Framework - init');

    callInitOnInstances(managers);
    callInitOnInstances(interfaces);
    
    loadThings(this);
};

Domey.prototype.manager = function ( type ){
	if(managers[type] == undefined){
		return undefined;
	}else{
		return managers[type];
	}
}

Domey.prototype.interface = function ( type ){
    if(interfaces[type] == undefined){
        return undefined;
    }else{
        return interfaces[type];
    }
}

Domey.prototype.getThings = function(){
    return things;   
}

Domey.prototype.getThing = function(thingName){
    for(i in things){
        if(things[i].name == thingName){
            return things[i];
        }
    }
}

Domey.prototype.getConfig = function(file, part){
    config = JSON.parse(fs.readFileSync(__dirname + '/../config/' + file + '.json', 'utf8'));
    config = config[file];
    
    if(part !== undefined){
        config = config[part];
    }
    return config;
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
        try{
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
        }catch(ex){
            console.log("Thing " + thingName + " not loaded: " + ex);
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

//returns list of files in path, relative to app.js
function getJSFilesInPath( path ){
    jsFiles = [];
     //for each thing in dir
    fs.readdirSync(__dirname + '/../' + path).forEach(function(file) {
        if(endsWith(file, '.js')){
            jsFiles.push(path + '/' + file);
        }
    });
    
    return jsFiles;                                   
}
    

//creates an instance from .js file given in path
function getInstanceFromFile( file ){
    //if given path is .js file
    if(endsWith(file, '.js')){
        var obj = require(__dirname + '/../' + file);
        var inst = new obj();
    
        return inst;
    }else{
        return undefined;
    }
}

//call init on instances in list
function callInitOnInstances( list ){
    for(var i in list){
        list[i].init();   
    }
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}