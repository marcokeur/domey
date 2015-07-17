var mongoose = require('mongoose');
var db = mongoose.connection;

var realtimeEventSchema = new mongoose.Schema({
    _id: { 
        thing: String,
        driver: String,
        device: String
    },
    events: {
        event: {
            type: String,
            value: String,
            when: { type: Date, default: Date.now}
        }
    }
});

    
function Persistence() 
{
	
}

module.exports = Persistence;



Persistence.prototype.init = function(){
	console.log("Persistence init");
    
    mongoose.connect('mongodb://localhost/domotica');
    
    var RealtimeEvent = mongoose.model('RealtimeEvent', realtimeEventSchema);
    
    Domey.manager('drivers').on('realtime', function(msg){
        console.log('store in db');
        
        var event = new RealtimeEvent({
            _id: {
            thing: msg.thing,
            driver: msg.driver,
            device: msg.device
            },
            event: {
                type: msg.state.type,
                value: msg.state.value
            }
        });
        
        RealtimeEvent.findOneAndUpdate(
            {_id: {
                thing: msg.thing,
                driver: msg.driver,
                device: msg.device
                }
            },
            {$push: {events: {
                        event: {
                            type: msg.state.type,
                            value: msg.state.value
                        }
                        }
                    }
            },
            {safe: true, upsert: true},
            function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log(event);
                }
            });
    });
};


