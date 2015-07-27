var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

function Flow() {
	EventEmitter.call(this);
}

module.exports = Flow;

util.inherits(Flow, EventEmitter);

var flowItems = [];
var flows;

var flowIdCounter = 0;

var self;

function FlowItem(type, meta, thingId, id) {
    this.type = type;
    this.meta = meta;
    this.thingId = thingId;
    this.id = id;
}

Flow.prototype.getName = function(){
    return 'flow';   
}

Flow.prototype.init = function () {
	console.log("flow mamanger - init");

    self = this;

    Domey.on('thing_registered', function (thing) {
        
        if (thing.meta.hasOwnProperty('flow')) {
            if (thing.meta.flow.hasOwnProperty('actions') && thing.meta.flow.actions.length > 0) {
                for (var i in thing.meta.flow.actions) {
                    var action = thing.meta.flow.actions[i];
                    console.log('flow manager - registering action: ' + action.title.en);

                    var item = new FlowItem('action', action, thing.meta.id, ++flowIdCounter);
                    flowItems.push(item);
                }
            }
        
            if(thing.meta.flow.hasOwnProperty('triggers') && thing.meta.flow.triggers.length > 0){
                for(var i in thing.meta.flow.triggers){
                    var trigger = thing.meta.flow.triggers[i];
                    console.log('flow manager - registering trigger: ' + trigger.title.en);

                    var item = new FlowItem('trigger', trigger, thing.meta.id, ++flowIdCounter);
                    flowItems.push(item);
                }
            }
            
            if(thing.meta.flow.hasOwnProperty('conditions') && thing.meta.flow.conditions.length > 0){
                for(var i in thing.meta.flow.conditions){
                    var condition = thing.meta.flow.conditions[i];
                    console.log('flow manager - registering condition: ' + condition.title.en);

                    var item = new FlowItem('condition', condition, thing.meta.id, ++flowIdCounter);
                    flowItems.push(item);
                }
            }
        }
    });
    
    Domey.on('all_things_registered', function(things){
        flows = Domey.getConfig('flows');
        console.log("flows : " + flows);
        for(var i in flows){
            console.log(flows[i].trigger);
            flows[i].trigger['item'] = getFlowItemByMethod(flows[i].trigger.method);
            for(var j in flows[i].trigger.conditionset.conditions){
                flows[i].trigger.conditionset.conditions[j]['item'] = getFlowItemByMethod(flows[i].trigger.conditionset.conditions[j].method);
            }
            for(var k in flows[i].trigger.conditionset.actions){
                flows[i].trigger.conditionset.actions[k]['item'] = getFlowItemByMethod(flows[i].trigger.conditionset.actions[k].method);
            }
        }
    });
};


Flow.prototype.trigger = function(method, args){   
    console.log('console log: trigger received: ' + method);
    
    var flowDescription = 'If ';
    
    //for each trigger we know
    for(var i in flows){
        trigger = flows[i].trigger;
                
        console.log(trigger);
        //check if it matches the method received
        if(method == trigger.method){
            //we have a match, emit the trigger to conditions        
            
            flowItem = getFlowItemByMethod(trigger.method);
            flowDescription += flowItem.meta.title.en;
            
            //for(j in trigger.conditionset){
                var conditionSetIsTrue = true;  //this will be the result of all conditions

                //a condition holds a conditionset, those conditions will be AND
                for(l in trigger.conditionset.conditions){
                    if(conditionSetIsTrue){
                        condition = trigger.conditionset.conditions[l];

                        flowItem = getFlowItemByMethod(condition.method);
                        flowDescription += ' and ';
                        flowDescription += flowItem.meta.title.en;

                        Domey.manager('flow').emit('condition.' + condition.method, condition.args[0], function(conditionIsTrue){
                            //check if the response is as expected
                            flowDescription += '('+conditionIsTrue+')';
                            if(conditionIsTrue != true){
                                conditionSetIsTrue = false;
                            }
                        });
                    }
                }
                
                //if all conditions were true
                if(conditionSetIsTrue){
                    for(k in trigger.conditionset.actions){
                        action = trigger.conditionset.actions[k];
                           
                        flowItem = getFlowItemByMethod(action.method);
                        flowDescription += ' then ';
                        flowDescription += flowItem.meta.title.en;
                              
                        this.callItem('action', action, action.args[0], function(response){
                           console.log(flowDescription);
                        });
                    }
                }else{
                    console.log('Flow stopped at: ' + flowDescription);
                }
            }
        //}
    }
}

Flow.prototype.callItem = function(type, flowItem, args, callback){
    self.emit(type + '.' + flowItem.method, args, function(response){
        callback(response);
    });
}

Flow.prototype.getItems = function(type){
    return flowItems;
}

Flow.prototype.getFlows = function(){
    return flows;   
}

function getFlowItemByMethod(method){
    for(i in flowItems){
        if(flowItems[i].meta.method == method){
            return flowItems[i];
        }
    }
}

Flow.prototype.getFlowItemById = function(id){
    for(i in flowItems){
        if(flowItems[i].id == id){
            return flowItems[i];
        }
    }
}

Flow.prototype.getFlowItemsByThing = function(thingId){
    var matches = [];

    for(i in flowItems){
    console.log(flowItems[i].thingId);
        if(flowItems[i].thingId == thingId){
            matches.push(flowItems[i]);
        }
    }

    return matches;
}