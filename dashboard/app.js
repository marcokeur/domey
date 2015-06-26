/**
 * Copyright 2014 Nicholas Humfrey
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var http = require('http');
var util = require("util");
var express = require("express");
var nopt = require("nopt");
var path = require("path");
var fs = require("fs");
var mqtt = require('mqtt');
var mongo = require('mongodb');
var mongoclient = mongo.MongoClient;
var mongoCollection;

var settings = require('./settings.js');

// Middleware
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var morgan  = require('morgan');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan());

browsers = [];
var topics = {};
tiles = require('./tiles.json');

//Mongo
mongoclient.connect(settings.mongoUrl, function(err, db){
    if(err){
        console.log('Unable to connect to mongoDB server: ', err);
    }else{
        console.log('Connected to: ', settings.mongoUrl);
        //for now we use the basetopic as collection name
        mongoCollection = db.collection(settings.mqttBaseTopic);

        //init the topic list with values from mongo
        initTopicList(function(topics){
            require('./api/topics')(app,topics);
        });
        
        require('./api/history.js')(app, mongoCollection);
        
        // Connect to the MQTT sever
        client = mqtt.createClient(settings.mqttPort, settings.mqttHost);

        //subscribe to the basetopic, so we get all submessages 
        client.subscribe(settings.mqttBaseTopic + '/#');

        // When a message is received from the MQTT server, call various callbacks
        client.on('message', function(topic, payload) {
            console.log("Received MQTT: " + topic + ": " +payload);

            //callback to both browsers an store in database
            callbackToBrowser(topic, payload);

            //if mongo is ready, start pushing
            callbackToMongo(mongoCollection, topic, payload);

        }); 
    }
});

//get last values from mongo
function initTopicList(callback){
    var cursor = mongoCollection.find({}, { events: { $slice: -1}});
    cursor.each(function(err, doc){
            if(err)
            {
                console.log("Failed reading from mongo");
            }else if(doc == null){
                //we are done
                callback(topics);            
            }else{
                topics[doc["_id"]] = doc["events"][0]["event"].value;
            }
        }                    
    ); 
}
    
//pass it on to the browsers
function callbackToBrowser(topic, payload){
    tiles.forEach(function(tile) {
        if(tile.subscribe_topic == topic){        
            topics[topic] = payload;

            browsers.forEach(function(res) {
                console.log("  informing browser: "+res);
                res.write("data: " + JSON.stringify({topic:topic, payload:payload}) + "\n\n");
            });
        }
    });
}

//pass to mongo
function callbackToMongo(collection, topic, payload){
    collection.update(
        { _id:topic },
        { $push: { events: { event: { value:payload, when:new Date() } } } },
        { upsert: true },
        function(err, docs){
            if(err)
            {
                console.log("Failed inserting into mongo on topic: ", topic);
            }
        }
    )
}


// Send a ping every 20 seconds to the browsers to keep the HTTP connections open
setInterval(function() {
    browsers.forEach(function(res) {
        res.write(": ping\n\n");
    });
}, 20000);


app.get('/tiles', function(req, res) {
    res.send(tiles);
});

app.get('/update-stream', function(req, res) {
    req.socket.setNoDelay(true);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    });
    res.write(":\n");

    browsers.push(res);

    Object.keys(topics).forEach(function(key) {
        res.write("data: " + JSON.stringify({topic:key, payload:topics[key]}) + "\n\n");
    });

    req.on("close", function() {
        index = browsers.indexOf(req);
        browsers.splice(index, 1);
    });
});





// Serve a static file, if it exists
app.use(express.static(path.join(__dirname, 'public')));


var server = http.createServer(app)
server.listen(settings.uiPort, settings.uiHost, function(){
    console.log('Express server listening on port ' + settings.uiPort);
});
