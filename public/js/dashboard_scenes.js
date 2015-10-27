function addEventHandlers(){
    $('.scene').click(function(event){
        var divId = $(this).attr('id');
        var sceneId = divId.split("_")[1];
        $.get('/api/scene/activate/' + sceneId);
    });
}