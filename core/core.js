var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var managers = [];
var interfaces = [];

function Domey(){
	EventEmitter.call(this);

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
}

module.exports = Domey;

util.inherits(Domey, EventEmitter);

Domey.prototype.init = function(){
	this.log(0, 0, 'Framework - init');

    callInitOnInstances(managers);
    callInitOnInstances(interfaces);
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
    process.stdout.write(line + '');
    process.stdout.write('\n');
}

Domey.prototype.getConfig = function(file, part){
    var config = JSON.parse(fs.readFileSync(__dirname + '/../config/' + file + '.json', 'utf8'));
    config = config[file];
    
    if(part !== undefined){
        config = config[part];
    }
    return config;
}

Domey.prototype.triggerAction = function(method, args){
    this.emit('action.' + method, args);
}

Domey.prototype.capabilityUpdated = function(thingName, driverName, deviceId, capabilityName, capabilityValue){
    this.emit('capabilityUpdated', { 'thing' : {
        'name': thingName,
        'driver': {
            'name': driverName,
            'deviceId': deviceId,
            'capability': {
                'name': capabilityName,
                'value': capabilityValue
            }
        }
    }});
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