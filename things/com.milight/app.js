function App()
{
    
}

module.exports = App;

App.prototype.init = function(){
    Domey.on('condition.lightEnabled', bulbEnabled);
    //Domey.on('condition.lightDisabled', bulbDisabled);

    Domey.on('action.enableBulb', enableBulb);
    //Domey.on('action.disableBulb', disableBulb);
}

function bulbEnabled(args, callback ){
    var driver = Domey.manager('drivers').getDriver( 'com.milight.bulb' );
    driver.capabilities.enabled.get( args, callback );
}

function enableBulb( args, callback ){
     var driver = Domey.manager('drivers').getDriver( 'com.milight.bulb' );
     driver.capabilities.enabled.set( args, true, function(){} );
}