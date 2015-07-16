module.exports = [
	{
		description:	"Get status",
		method: 		'GET',
		path:			'/',
        driver:         'bulb',
		fn: function( driver, callback, args ){
            driver.getStatus( callback );
		}
	},
	
	
	{
		description:	"Lights on",
		method: 		'GET',
		path:			'/on',
        driver:         'bulb',
		fn: function( driver, device, callback, args ){
			driver.capabilities.onoff.set( device, true, callback );
		}
	},
	
	
	{
		description:	"Lights off",
		method: 		'GET',
		path:			'/off',
        driver:         'bulb',
		fn: function( driver, device, callback, args ){
			driver.capabilities.onoff.set( device, false, callback );
		}
	}	
]