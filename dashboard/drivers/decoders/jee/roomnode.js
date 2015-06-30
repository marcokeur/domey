//app.register 'driver.roomnode',

module.exports = {
    decode: function(data){
      raw = data.msg

      temperature = (((256 * (raw[5]&3) + raw[4]) ^ 512) - 512).toString();
      temperature = temperature.substring(0,2) + '.' + temperature.substring(temperature.length -1);
    
      retvalue = { 
          light: Number((raw[2] / 255 * 100)).toFixed(), 
          humidity: raw[3] >> 1, 
          motion: raw[3] & 1, 
          temperature: temperature 
      }
      return retvalue;
    }
}