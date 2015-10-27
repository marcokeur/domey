function getCollection(collection, target, callback){
    $.getJSON('/api/'+collection, function(data){
        $.each(data.response, function(key, val) {
            $(target).append("<div class='"+collection+"' id='"+collection+"_" + val.id + "'>");
            //$("#" + collection + "_" + val.id).append("<span class='glyphicon " + val.icon + "'></span>");
            $("#" + collection + "_" + val.id).append(val.name);
        });


        callback();
    });
}
