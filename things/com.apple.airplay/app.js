function App()
{
    
}

module.exports = App;

App.prototype.init = function(){
	// flow:action:dock
	Domey.manager('flow').on('action.play', function( args, callback ){
		if( typeof args.device == 'undefined' ) return;
		console.log(args);
		var driver = Domey.manager('drivers').getDriver( args.device.driver.id );
			driver.capabilities.play.set( args.device.data, args.device.args.file, callback );
	});

    Domey.manager('flow').on('action.stop', function( args, callback ){
        if( typeof args.device == 'undefined' ) return;
        var driver = Domey.manager('drivers').getDriver( args.device.driver.id );
            driver.capabilities.stop.set( args.device.data, callback );
    });
}