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