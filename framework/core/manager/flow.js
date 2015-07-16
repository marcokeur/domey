var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Flow() {
	EventEmitter.call(this);
}

module.exports = Flow;

util.inherits(Flow, EventEmitter);

var flowItems = [];

function FlowItem(type, meta) {
    this.type = type;
    this.meta = meta;
}

Flow.prototype.init = function () {
	console.log("flow mamanger - init");
    
    Manager.on('thing_registered', function (thing) {
        
        if (thing.meta.hasOwnProperty('flow')) {
            if (thing.meta.flow.hasOwnProperty('actions') && thing.meta.flow.actions.length > 0) {
                for (var i in thing.meta.flow.actions) {
                    var action = thing.meta.flow.actions[i];
                    console.log('flow manager - registering action: ' + action.title.en);

                    var item = new FlowItem('action', action);
                    flowItems.push(item);
                }
            }
        
            if(thing.meta.flow.hasOwnProperty('triggers') && thing.meta.flow.triggers.length > 0){
                for(var i in thing.meta.flow.triggers){
                    var trigger = thing.meta.flow.triggers[i];
                    console.log('flow manager - registering trigger: ' + trigger.title.en);

                    var item = new FlowItem('trigger', trigger);
                    flowItems.push(item);
                }
            }
            
            if(thing.meta.flow.hasOwnProperty('conditions') && thing.meta.flow.conditions.length > 0){
                for(var i in thing.meta.flow.conditions){
                    var condition = thing.meta.flow.conditions[i];
                    console.log('flow manager - registering trigger: ' + condition.title.en);

                    var item = new FlowItem('condition', condition);
                    flowItems.push(item);
                }
            }
        }
    });
    
    
    //test flow
    Manager.on('testflow', function(trigger){
        var args = {
            device : {
                driver : {
                    id : 'bulb'
                },
                data : {
                    id : 0
                }
            }
        }
        Manager.manager('flow').emit('action.enable', args, function(data){
            console.log('!!!callback!!!');
            console.log(data);
           
            Manager.manager('flow').emit('action.disable', args, function(data){
                console.log('!!!callback!!!');
                console.log(data);
                Manager.manager('flow').emit('condition.enabled', args, function(data){
                    console.log('condition');
                    console.log(data); 
                });
            });
        });
        console.log('testflow emitted');

    });
};

Flow.prototype.getItems = function(type){
    return flowItems;
}