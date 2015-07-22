function App()
{
    
}

module.exports = App;

App.prototype.init = function(){
    
    Domey.manager('flow').on('condition.motion', function( args, callback ){
        if( typeof args.device == 'undefined' ) return;
        var driver = Domey.manager('drivers').getDriver( args.device.driver.id );
        driver.capabilities.motion.get( args.device.data, callback );
    });
}