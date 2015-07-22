function App()
{
    
}

module.exports = App;

App.prototype.init = function(){
    
    Domey.manager('flow').on('condition.enabled', function( args, callback ){
        if( typeof args.device == 'undefined' ) return;
        var driver = Domey.manager('drivers').getDriver( args.device.driver.id );
        driver.capabilities.enabled.get( args.device.data, callback );
    });
    
    Domey.manager('flow').on('condition.disabled', function( args, callback ){
        if( typeof args.device == 'undefined' ) return;
        var driver = Domey.manager('drivers').getDriver( args.device.driver.id );
        driver.capabilities.disabled.get( args.device.data, callback );
    });
    
    Domey.manager('flow').on('action.enable', function( args, callback ){
        if( typeof args.device === undefined ) return;
        var driver = Domey.manager('drivers').getDriver( args.device.driver.id );
        driver.capabilities.enabled.set( args.device.data, true, callback );
    });
    
    Domey.manager('flow').on('action.disable', function( args, callback ){
        if( typeof args.device === undefined ) return;
        var driver = Domey.manager('drivers').getDriver( args.device.driver.id );
        driver.capabilities.enabled.set( args.device.data, false, callback );
    });
}