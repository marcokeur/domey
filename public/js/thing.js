var socket = io.connect();
socket.on('connect', function() {
  socket.send(window.location);
});

socket.on('realtime', function(msg) {
    //console.log(JSON.stringify(msg));
    var rowid = msg.device+'_'+msg.state.type;
    rowid = rowid.replace(/:/g, '-');
    
    $('#'+rowid).remove();
    $('#'+msg.driver).prepend('<tr id="'+rowid+'"><td>'+msg.device+'</td><td>'+msg.state.type+'</td><td>'+msg.state.value+'</td></tr>');
});

socket.on('dashboard_items', function(msg) {
    console.log(msg);
});

function callFlowItem(type, id, driver, deviceId){

    var args = { "args" : [
                        {
                           "device": {
                               "driver": {
                                   "id": driver
                               },
                               "data": {
                                   "id": deviceId
                               }
                           }
                       }
                       ]};
    $.ajax
    ({
        type: "POST",
        url: '/api/flow/'+ type +'/call/' + id,
        dataType: 'json',
        async: false,
        data:  args,
        success: function (response) {
            alert('response was: ' + JSON.stringify(response));
        }
    })
}