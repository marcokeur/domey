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

    Domey.manager('web').addApiCall('GET', 'flow', self.apiGetCollection, self.apiGetElement);

    Domey.on('thing_registered', function (thing) {
        /* parse metadata from a registered 'thing' and register callbacks
        */
        if (thing.meta.hasOwnProperty('flow')) {
            if (thing.meta.flow.hasOwnProperty('actions') && thing.meta.flow.actions.length > 0) {
                for (var i in thing.meta.flow.actions) {
                    var action = thing.meta.flow.actions[i];
                    Domey.log(3, 1, 'flow manager - registering action: ' + action.title.en);

                    var item = new FlowItem('action', action, thing.meta.id, ++flowIdCounter);
                    flowItems.push(item);

                }
            }
        
            if(thing.meta.flow.hasOwnProperty('triggers') && thing.meta.flow.triggers.length > 0){
                for(var i in thing.meta.flow.triggers){
                    var trigger = thing.meta.flow.triggers[i];
                    Domey.log(3, 1, 'flow manager - registering trigger: ' + trigger.title.en);

                    var item = new FlowItem('trigger', trigger, thing.meta.id, ++flowIdCounter);
                    flowItems.push(item);
                }
            }
            
            if(thing.meta.flow.hasOwnProperty('conditions') && thing.meta.flow.conditions.length > 0){
                for(var i in thing.meta.flow.conditions){
                    var condition = thing.meta.flow.conditions[i];
                    Domey.log(3, 1, 'flow manager - registering condition: ' + condition.title.en);

                    var item = new FlowItem('condition', condition, thing.meta.id, ++flowIdCounter);
                    flowItems.push(item);
                }
            }
        }
    });
    
    Domey.on('all_things_registered', function(things){
        self.flows = Domey.getConfig('flows');

        for(var i in self.flows){
            self.flows[i].trigger['item'] = getFlowItemByMethod(self.flows[i].trigger.method);
            for(var j in self.flows[i].trigger.conditionset.conditions){
                self.flows[i].trigger.conditionset.conditions[j]['item'] = getFlowItemByMethod(self.flows[i].trigger.conditionset.conditions[j].method);
            }
            for(var k in self.flows[i].trigger.conditionset.actions){
                self.flows[i].trigger.conditionset.actions[k]['item'] = getFlowItemByMethod(self.flows[i].trigger.conditionset.actions[k].method);
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
    }
}



Flow.prototype.callItem = function(type, flowItem, args, callback){
    self.emit(type + '.' + flowItem.method, args, function(response){
        callback(response);
    });
}

function getFlowItemByMethod(method){
    for(i in flowItems){
        if(flowItems[i].meta.method == method){
            return flowItems[i];
        }
    }
}

Flow.prototype.apiGetCollection = function(){
    var response = [];

    //set http response code
    response['status'] = 200;
    response['data'] = [];

    //find the specific flow
    for(var i in self.flows){
        var element = {};

        //add data
        element.id = self.flows[i].id;
        element.name = self.flows[i].name;
        element.desc = self.flows[i].desc;

        response['data'].push(element);

    }

    return response;
}

Flow.prototype.apiGetElement = function(element){
    var response = [];

    //find the specific flow
    for(var i in self.flows){
        //if correct flow is found
        if(self.flows[i].id == element){
            //set http response code
            response['status'] = 200;
            response['data'] = {};

            //add data
            response['data'].id = self.flows[i].id;
            response['data'].name = self.flows[i].name;
            response['data'].desc = self.flows[i].desc;

            return response;
        }
    }

    response['status'] = 404;
    return response;
}