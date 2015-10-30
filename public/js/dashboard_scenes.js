function loadScenes(selector){
    getCollection('scene', selector, addElement, addEventHandlers);
}

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

function addElement(collection, val, target){
    $(target).append("<div class='"+collection+"' id='"+collection+"_" + val.id + "'>");

    if(val.icon != undefined){
        $("#" + collection + "_" + val.id).append("<img src='" + val.icon + "' />");
    }

    $("#" + collection + "_" + val.id).append("<span class='caption'>" + val.name + "</span>");

    if(val.active){
        $('#' + collection + '_' + val.id).css('color', 'red');
    }

}