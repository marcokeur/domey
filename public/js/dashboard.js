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
