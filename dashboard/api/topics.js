module.exports = function(app, topics){
    app.get('/topics', function(req, res) {
        res.send(topics);
    });

    app.get('/topics/*', function(req, res) {
        var topic = req.params[0];
        res.type('text/plain');
        if (topic in topics) {
            res.status(200).send(topics[topic]);
        } else {
            res.status(404).send('Topic Not Found');
        }
    });

    app.post('/topics/*', function(req, res) {
	if(req.cookies.authorized){
        	var topic = req.params[0];
        	console.log("Publishing: '"+req.body.payload+"' to '"+topic+"'");
        	client.publish(topic, req.body.payload);
        	res.status(204).end();
	}else{
		res.status(401).end();
	}
    });
}
