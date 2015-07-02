module.exports = function(app, mongoCollection){
    /* return results for one hour (no aggreagtation) */
    app.get('/history/hour/*', function(req, res) {
        var topic = req.params[0];
        res.type('text/plain');

        //one entry every hour
        mongoCollection.aggregate([
            { $match : { _id : topic }},
            { $project : { _id: 0, events: 1 }},
            { $unwind : "$events" },
            { $group : { "_id": "$events.event.when",            
                "value": { "$first" : "$events.event.value" },
                "when": { "$first" : "$events.event.when" }       
                       }
            },
            { $project : { _id: 0,
                          value: 1,
                          when: {
                            minute : { "$minute" : "$when" },
                            hour : { "$hour" : "$when" },
                            day : { "$dayOfMonth" : "$when" },
                            month : { "$month" : "$when" },
                            year : { "$year" : "$when" },
                            }
                         }
            },
            { $sort : { when : -1 } }
            ], function(err, doc) {
                res.json(doc);
        });

    });
    
    /* return results for one week (aggreagted by 15 minutes) */
    app.get('/history/day/*', function(req, res) {
        var topic = req.params[0];
        //var topic = 'revspace/sensors/nose/MQ-135'
        res.type('text/plain');

        //one entry every hour
        mongoCollection.aggregate([
            { $match : { _id : topic }},
            { $project : { _id: 0, 
                           events: 1,
                         }
            },
            { $unwind : "$events" },
            { $group : { "_id": {
                "$subtract": [
                    { "$subtract" : [ "$events.event.when", new Date("1970-01-01") ] },
                    { "$mod": [ 
                        { "$subtract": [ "$events.event.when", new Date("1970-01-01") ] },
                        1000 * 60 * 15
                    ]}
                ]
            },
                "value": { "$first" : "$events.event.value" },
                "when": { "$first" : "$events.event.when" }
                }
            },
            { $project : { _id: 0,
                          value: 1,
                          when: {
                            minute : { "$minute" : "$when" },
                            hour : { "$hour" : "$when" },
                            day : { "$dayOfMonth" : "$when" },
                            month : { "$month" : "$when" },
                            year : { "$year" : "$when" },
                            }
                         }
            },
            { $sort : { when : -1 } }
            ], function(err, doc) {
                res.json(doc);
        });

    });
    
    /* return results for one week (aggreagted by hour) */
    app.get('/history/week/*', function(req, res) {
        console.log(mongoCollection);
        var topic = req.params[0];
        //var topic = 'revspace/sensors/nose/MQ-135'
        res.type('text/plain');

        //one entry every hour
        mongoCollection.aggregate([
            { $match : { _id : topic }},
            { $unwind : "$events" },
            { $group : { "_id": {
                            "hour" : { "$hour" : "$events.event.when" },
                            "day" : { "$dayOfMonth" : "$events.event.when" },
                            "month" : { "$month" : "$events.event.when" },
                            "year" : { "$year" : "$events.event.when" },
                            },
                        "value": { "$first" : "$events.event.value" },
                        "when": { "$first" : "$events.event.when" },
                        },
            }, 
            { $project : { _id: 0,
                          value: 1,
                          when: {
                            minute : { "$minute" : "$when" },
                            hour : { "$hour" : "$when" },
                            day : { "$dayOfMonth" : "$when" },
                            month : { "$month" : "$when" },
                            year : { "$year" : "$when" },
                            }
                         }
            },
            { $sort : { when : 1 } }
            ], function(err, doc) {
                res.json(doc);
        });

    });
    
    /* return results for one month (aggreagted by 3 hours) */
    app.get('/history/month/*', function(req, res) {
        var topic = req.params[0];
        //var topic = 'revspace/sensors/nose/MQ-135'
        res.type('text/plain');

        //one entry every hour
        mongoCollection.aggregate([
            { $match : { _id : topic }},
            { $project : { _id: 0, events: 1 }},
            { $unwind : "$events" },
            { $group : { "_id": {
                "$subtract": [
                    { "$subtract" : [ "$events.event.when", new Date("1970-01-01") ] },
                    { "$mod": [ 
                        { "$subtract": [ "$events.event.when", new Date("1970-01-01") ] },
                        1000 * 60 * 60 * 3
                    ]}
                ]
            },
            "value": { "$first" : "$events.event.value" },
            "when": { "$first" : "$events.event.when" }
                       }
            },
            { $project : { _id: 0,
                          value: 1,
                          when: {
                            minute : { "$minute" : "$when" },
                            hour : { "$hour" : "$when" },
                            day : { "$dayOfMonth" : "$when" },
                            month : { "$month" : "$when" },
                            year : { "$year" : "$when" },
                            }
                         }
            },
            { $sort : { when : -1 } }
            ], function(err, doc) {
                res.json(doc);
        });

    });
    
    /* return results for one year (aggregated by day) */
    app.get('/history/year/*', function(req, res) {
        var topic = req.params[0];
        //var topic = 'revspace/sensors/nose/MQ-135'
        res.type('text/plain');

        //one entry every hour
        mongoCollection.aggregate([
            { $match : { _id : topic }},
            { $project : { _id: 0, events: 1 }},
            { $unwind : "$events" },
            { $group : { "_id": {
                "day" : { "$dayOfMonth" : "$events.event.when" },
                "month" : { "$month" : "$events.event.when" },
                "year" : { "$year" : "$events.event.when" },
            },
            "value": { "$first" : "$events.event.value" },
            "when": { "$first" : "$events.event.when" }
                       }
            },
            { $project : { _id: 0,
                          value: 1,
                          when: {
                            minute : { "$minute" : "$when" },
                            hour : { "$hour" : "$when" },
                            day : { "$dayOfMonth" : "$when" },
                            month : { "$month" : "$when" },
                            year : { "$year" : "$when" },
                            }
                         }
            },
            { $sort : { when : -1 } }
            ], function(err, doc) {
                res.json(doc);
        });

    });
}