function App()
{
    
}

module.exports = App;

App.prototype.init = function(){
    
    Homey.manager('flow').on('action.on', function( args, callback ){
        console.log('lights on milight');
        if( typeof args.device === undefined ) return;
        var driver = Homey.manager('drivers').getDriver( args.device.driver.id );
        driver.capabilities.onoff.set( args.device.data, true, callback );
    });
    
    Homey.manager('flow').on('action.off', function( args, callback ){
        console.log('lights off milight');
        if( typeof args.device === undefined ) return;
        var driver = Homey.manager('drivers').getDriver( args.device.driver.id );
        driver.capabilities.onoff.set( args.device.data, false, callback );
    });
}