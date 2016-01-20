function loadThings(selector, cb){
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
        updateElement(data, '#thingsTable');
    });
}

function updateElement(data, target){
    deleteElement(data, target);
    addElement(data,target);
}

function deleteElement(data, target){
    var selector = "#" + createCssIdFromThingObject(data.thing);
    $(selector).remove();
}
var even = true;
function addElement(data, target){
    var selector = target + ' > tbody';
    var className;
    if(even){
        className='even';
        even = false;
    }else{
        className = 'odd';
        even = true;
    }

    $("<tr class='"+className+"' id=\""+createCssIdFromThingObject(data.thing)+
    "\">" +
    "<td>" + data.thing.name + "</td>" +
    "<td>" + data.thing.driver.name + "</td>" +
    "<td>" + data.thing.driver.deviceId + "</td>" +
    "<td>" + data.thing.driver.capability.name + "</td>" +
    "<td>" + data.thing.driver.capability.value + "</td>" +
    //"<td><input></input></td>" +
    "</tr>").prependTo(selector);

/*
    $('#' + createCssIdFromThingObject(data.thing)).find('input').keypress(function (e) {
       if (e.which == 13) {
           //$('form#login').submit();
           console.log('lol');
           return false;    //<---- Add this line
       }
   });
   */
}

function getCapability(thing, driver, capability, deviceId, target, callback){
    $.getJSON('/api/thing/'+thing+'/'+driver+'/'+deviceId+'/'+capability, function(data){

        addElement(data.response, target);

        if(callback != undefined){
            callback();
        }
    });
}

function createCssIdFromThingObject(thing){
    var id = thing.name+
    "_"+thing.driver.name+
    "_"+thing.driver.deviceId+
    "_"+thing.driver.capability.name;

    id =  id.replace(/\./g, '');

    return id;
}