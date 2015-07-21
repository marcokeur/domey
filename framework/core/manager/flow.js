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
function FlowItem(type, meta) {
    this.type = type;
    this.meta = meta;
}

Flow.prototype.getName = function(){
    return 'flow';   
}

Flow.prototype.init = function () {
	console.log("flow mamanger - init");
    
    Domey.on('thing_registered', function (thing) {
        
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
                    console.log('flow manager - registering condition: ' + condition.title.en);

                    var item = new FlowItem('condition', condition);
                    flowItems.push(item);
                }
            }
        }
    });
    
    Domey.on('all_things_registered', function(things){
        //flows = JSON.parse(fs.readFileSync(__dirname + '/../../config/flows.json', 'UTF-8'));
        
        flows = Domey.getConfig('flows');
        
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
    for(var i in flows.triggers){
        trigger = flows.triggers[i];
                
        //check if it matches the method received
        if(method == trigger.method){
            //we have a match, emit the trigger to conditions        
            
            flowItem = getFlowItemByMethod(trigger.method);
            flowDescription += flowItem.meta.title.en;
            
            for(j in trigger.conditionsets){
                var conditionSetIsTrue = true;  //this will be the result of all conditions
                
                conditionset = trigger.conditionsets[j];

                //a condition holds a conditionset, those conditions will be AND
                for(l in conditionset.conditions){
                    if(conditionSetIsTrue){
                        condition = conditionset.conditions[l];

                        flowItem = getFlowItemByMethod(condition.method);
                        flowDescription += ' and ';
                        flowDescription += flowItem.meta.title.en;

                        Domey.manager('flow').emit('condition.' + condition.method, condition.args[0], function(conditionIsTrue){
                            //check if the response is as expected
                            flowDescription += '('+conditionIsTrue+')';
                            if(!conditionIsTrue){
                                conditionSetIsTrue = false;
                                //break;
                            }
                        });
                    }
                }
                
                //if all conditions were true
                if(conditionSetIsTrue){
                    for(k in conditionset.actions){
                        action = conditionset.actions[k];
                           
                        flowItem = getFlowItemByMethod(action.method);
                        flowDescription += ' then ';
                        flowDescription += flowItem.meta.title.en;
                              
                        Domey.manager('flow').emit('action.' + action.method, action.args[0], function(response){
                           console.log(flowDescription);
                        });
                    }
                }else{
                    console.log('Flow stopped at: ' + flowDescription);
                }
            }
        }
    }
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