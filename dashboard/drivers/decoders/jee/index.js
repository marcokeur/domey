var settings = require('../../../settings.js');

require('fs').readdirSync(__dirname + '/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    var name = file.replace('.js', '');
    exports[name] = require('./' + file);
  }
});

module.exports = {
    decode: function(data){
        try{
            //call the mapped decoder
            decoded = exports[settings.jee.deviceMap[data.type].type].decode(data);
            
            return decoded;
        }catch(ex){
            console.log(ex);
            return { error: "no suitable decoder found" };
        }
    }
}