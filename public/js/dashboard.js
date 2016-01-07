function getCollection(collection, target, addElement, callback){
    $.getJSON('/api/'+collection, function(data){
        $.each(data.response, function(key, val) {
            addElement(collection, val, target);
        });


        if(callback != undefined){
            callback();
        }
    });
}

var itemCache = Array();

function getCapabilityValue(thingName, driverName, deviceId, capability, selector, pre, post){
    var prefix = '';
    var postfix = '';

    $.getJSON('/api/thing/' + thingName + '/' + driverName + '/' + deviceId + '/' + capability, function(data){
        if(typeof pre != 'undefined')
            prefix = pre;
        if(typeof post != 'undefined')
            postfix = post;

        $(selector).html(prefix + data.response.thing.driver.capability.value + postfix);
    });

    this.itemCache.push({"name":thingName,
                    "driver" : {
                        "name" : driverName,
                        "deviceId": deviceId,
                        "capability" : {
                            "name" : capability,
                            "selector" : selector,
                            "prefix" : prefix,
                            "postfix": postfix
                        }
                    }
               });
}

function updateElement(data){
    this.itemCache.forEach(function(item){
        if(item.name == data.thing.name &&
           item.driver.name == data.thing.driver.name &&
           item.driver.deviceId == data.thing.driver.deviceId &&
           item.driver.capability.name == data.thing.driver.capability.name){
            $(item.driver.capability.selector).html(item.driver.capability.prefix + data.thing.driver.capability.value + item.driver.capability.postfix);
        }
    });
}

function openDashWebSocketConnection(){
    var socket = io();

    socket.on('capabilityUpdated', function(data){
        updateElement(data);
    });
}

