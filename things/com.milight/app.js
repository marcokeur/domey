function App()
{
    
}

module.exports = App;

App.prototype.init = function(){
    Domey.on('condition.lightEnabled', bulbEnabled);
    Domey.on('condition.lightDisabled', bulbDisabled);

    Domey.on('action.enableBulb', enableBulb);
    Domey.on('action.disableBulb', disableBulb);
}

function bulbDisabled(args, callback ){
    var driver = Domey.manager('drivers').getDriver( 'com.milight.bulb' );
    driver.capabilities.disabled.get( args, callback );
}

function bulbEnabled(args, callback ){
    var driver = Domey.manager('drivers').getDriver( 'com.milight.bulb' );
    driver.capabilities.enabled.get( args, callback );
}

function enableBulb( args, callback ){
    console.log('enableBulb' + args);
     var driver = Domey.manager('drivers').getDriver( 'com.milight.bulb' );
     driver.capabilities.enabled.set( args, true, function(){} );
}

function disableBulb( args, callback ){
     var driver = Domey.manager('drivers').getDriver( 'com.milight.bulb' );
     driver.capabilities.enabled.set( args, false, function(){} );
}