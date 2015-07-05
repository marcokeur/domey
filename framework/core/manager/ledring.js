"use strict";
  
function Ledring() 
{
	
}

module.exports = Ledring;

Ledring.prototype.init = function(){
	console.log("ledring init");
};

Ledring.prototype.animate = function( data ) {
	console.log(data);
}
