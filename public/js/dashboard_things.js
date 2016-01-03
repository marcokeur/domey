function loadScenes(selector, cb){
    //getCollection('scene', selector, addElement, addEventHandlers);
    $.getJSON('/api/thing', function(data){
       $.each(data.response.things, function(key, value){
           //{"name":"com.milight","drivers":[{"name":"bulb","capabilities":["enabled","disabled","brightness","hue"]}
           $.each(value.drivers, function(key2, value2){
               $.each(value2.capabilities, function(key3, value3){
                   $.each(value2.devices, function(deviceKey, deviceValue){
                       getCapability(value.name, value2.name, value3, deviceValue, selector, cb);
                   })

               })
           })
       });
    });
}

function openWebSocketConnection(){
    var socket = io();

    socket.on('capabilityUpdated', function(data){
        console.log(data);
        updateElement(data, '#thingsTable');
    });
}


function updateElement(data, target){
    deleteElement(data, target);
    addElement(data,target);
}

function deleteElement(data, target){
    var selector = "#" + data.thing.name+
        "_"+data.thing.driver.name+
        "_"+data.thing.driver.deviceId+
        "_"+data.thing.driver.capability.name;
    $(selector).remove();
}

function addElement(data, target){
    $(target).append("<tr id=\""+
    data.thing.name+
    "_"+data.thing.driver.name+
    "_"+data.thing.driver.deviceId+
    "_"+data.thing.driver.capability.name+
    "\">" +
    "<td>" + data.thing.name + "</td>" +
    "<td>" + data.thing.driver.name + "</td>" +
    "<td>" + data.thing.driver.deviceId + "</td>" +
    "<td>" + data.thing.driver.capability.name + "</td>" +
    "<td>" + data.thing.driver.capability.value + "</td>" +
    "</tr>");

    console.log(data);

}

function getCapability(thing, driver, capability, deviceId, target, callback){
    $.getJSON('/api/thing/'+thing+'/'+driver+'/'+capability+'/'+deviceId, function(data){

        addElement(data.response, target);


        if(callback != undefined){
            callback();
        }
    });
}