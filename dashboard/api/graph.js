module.exports = function(app, mongoCollection){
    /* return results for one week (aggreagted by 15 minutes) */
    app.get('/graph/day/*', function(req, res) {
        var topic = req.params[0];
        
        res.type('text/plain');

        res.json(doc);

    });
}