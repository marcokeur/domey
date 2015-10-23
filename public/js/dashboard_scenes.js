$(document).ready(function(){
    $.getJSON('/api/scene/get/all', function(data){
        $.each(data.response, function(key, val) {
            //alert(val.name);
            $("div.row").append("<div class='scene' id='scene_" + val.id + "'>");
            $("div.row").append("<span class='glyphicon " + val.icon + "'></span>");
            $("div.row").append(val.name);
            $("div.row").append("</div>");
        });


        addEventHandlers();
    });
});

function addEventHandlers(){
    $('.scene').click(function(event){
        var divId = $(this).attr('id');
        var sceneId = divId.split("_")[1];
        $.get('/api/scene/activate/' + sceneId);
    });
}