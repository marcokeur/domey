var mongoose = require('mongoose');
var db = mongoose.connection;

var realtimeEventSchema = new mongoose.Schema({
    _id: { 
        driver: String,
        device: String
    },
    events: {
        event: {
            key: String,
            value: String,
            when: Date
        }
    }
});

module.exports.RealtimeEvent = mongoose.model('RealtimeEvent', realtimeEventSchema);
        
function Persistence() 
{
	
}

module.exports = Persistence;



Persistence.prototype.init = function(){
	console.log("Persistence init");
    Manager.manager('drivers').on('realtime', function(msg){
        console.log('store in db');
    });
};


