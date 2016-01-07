function loadFlows(selector){
    //getCollection('scene', selector, addElement, addEventHandlers);

    $.getJSON('/api/flow', function(data){
        $.each(data.response.flows, function(key, scene){
            addElement(scene, selector);
        })
    })
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

    $("<tr class='"+className+"' id=\""+createCssIdFromSceneObject(data)+
    "\">" +
    "<td>" + data.name + "</td>" +
    "<td>" + data.desc + "</td>" +
    //"<td>" + JSON.stringify(data.enable) + "</td>" +
    //"<td>" + JSON.stringify(data.disable) + "</td>" +
    //"<td>" + data.active + "</td>" +
    "</tr>").prependTo(selector);
}

/*
function addEventHandlers(){
    $('.scene').click(function(event){
        var divId = $(this).attr('id');
        var sceneId = divId.split("_")[1];
        $.get('/api/scene/' + sceneId + '/activate');

        //reload content
        $('.row').empty();
        loadScenes('.row');
    });
}

function addElement(data, target){
    $(target).append("<div class='"+collection+"' id='"+collection+"_" + val.id + "'>");

    if(val.icon != undefined){
        $("#" + collection + "_" + val.id).append("<img src='" + val.icon + "' />");
    }

    $("#" + collection + "_" + val.id).append("<span class='caption'>" + val.name + "</span>");

    if(val.active){
        $('#' + collection + '_' + val.id).css('color', 'red');
    }

}
*/

function createCssIdFromSceneObject(data){
    var id = data.name + "_" + data.id;

    id =  id.replace(/\./g, '');

    return id;
}