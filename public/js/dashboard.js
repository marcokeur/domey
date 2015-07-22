var socket = io.connect();
socket.on('connect', function() {
  socket.send(window.location);
});

socket.on('realtime', function(msg) {
    console.log(msg);
        $("div").find('[driver=\"'+msg.driver+'\"][device=\"'+msg.device+'\"][state=\"'+msg.state.type+'\"]').find("div.panel-body").text(msg.state.value);
});