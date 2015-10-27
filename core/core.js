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

//loglevel 0 is critical, 1 is important, 2 is info, 3 is verbose
Domey.prototype.log = function(level, indent, line){
    switch(level){
        case 0:
            process.stdout.write('[CRITICAL]');
            break;
        case 1:
            process.stdout.write('[IMPORTANT]');
            break;
        case 2:
            process.stdout.write('[INFO]');
            break;
        case 3:
            process.stdout.write('[VERBOSE]');
            break;
    }

    for(var i = 0; i < indent; i++){
        process.stdout.write('    ');
    }
    process.stdout.write(line);
    process.stdout.write('\n');
}

Domey.prototype.getConfig = function(file, part){
    config = JSON.parse(fs.readFileSync(__dirname + '/../config/' + file + '.json', 'utf8'));
    config = config[file];
    
    if(part !== undefined){
        config = config[part];
    }
    return config;
}

Domey.prototype.getThingConfig = function(thingName, part){
    config = JSON.parse(fs.readFileSync(__dirname + '/../things/' + thingName + '/config.json', 'utf8'));
    config = config[thingName];

    if(part !== undefined){
        config = config[part];
    }
    return config;
}

function getThingMetaData(thingName, part){
    meta = JSON.parse(fs.readFileSync(__dirname + '/../things/' + thingName + '/app.json', 'utf8'));
    //config = config[thingName];

    if(part !== undefined){
        meta = meta[part];
    }
    return meta;
}

function installDependencies( dependencies, callback ){
    var depList = [];
    for(var dep in dependencies){
        console.log(dep + "@" + dependencies[dep]);
        depList.push(dep + "@" + dependencies[dep]);
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
            //console.log(message);
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
    //for each thing in dir
    fs.readdirSync(__dirname + '/../things/').forEach(function(thingName, index, array) {
        try{
            var thingDir = __dirname + '/../things/' + thingName + '/';

            //load the metadata
            var meta = getThingMetaData(thingName);

            //check if the thing already has been installed
            if(!fs.existsSync(thingDir + '.installed')){
                console.log('Unknown thing, lets install it\'s dependencies');
                //if not, install dependencies
                    installDependencies(meta.dependencies, function(){
                        //lets mark the thing as installed
                        fs.closeSync(fs.openSync(thingDir + '.installed', 'w'));

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