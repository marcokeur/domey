var types = require("HAP-NodeJS/accessories/types.js");

function MiLight(config) {
	this.name = config["name"];
	this.id = config["id"];
	this.type = config["type"];
	this.driver = Domey.manager('drivers').getDriver( 'bulb' );
}

MiLight.prototype = {

	setPowerState: function(powerOn) {
		console.log("Setting power state of zone " + this.name + " to " + powerOn);

		var data = { "id": this.id }
		this.driver.capabilities.enabled.set( data, powerOn, function(){
			console.log('done');
		});
	},

	setBrightnessLevel: function(value) {
		console.log("Setting brightness level of zone " + this.name + " to " + value);

		var data = { "id": this.id }
		this.driver.capabilities.brightness.set( data, value, function(){
			console.log('done');
        });
	},

	setHue: function(value) {
		console.log("Setting hue of zone " + this.name + " to " + value);

		var data = { "id": this.id }
		this.driver.capabilities.hue.set( data, value, function(){
			console.log('done');
		});
	},


	getServices: function() {
		var that = this;
		var services = [{
			sType: types.ACCESSORY_INFORMATION_STYPE,
			characteristics: [{
				cType: types.NAME_CTYPE,
				onUpdate: null,
				perms: ["pr"],
				format: "string",
				initialValue: this.name,
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Name of the accessory",
				designedMaxLength: 255
			}, {
				cType: types.MANUFACTURER_CTYPE,
				onUpdate: null,
				perms: ["pr"],
				format: "string",
				initialValue: "MiLight",
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Manufacturer",
				designedMaxLength: 255
			}, {
				cType: types.MODEL_CTYPE,
				onUpdate: null,
				perms: ["pr"],
				format: "string",
				initialValue: this.type,
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Model",
				designedMaxLength: 255
			}, {
				cType: types.SERIAL_NUMBER_CTYPE,
				onUpdate: null,
				perms: ["pr"],
				format: "string",
				initialValue: "MILIGHT1234",
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "SN",
				designedMaxLength: 255
			}, {
				cType: types.IDENTIFY_CTYPE,
				onUpdate: null,
				perms: ["pw"],
				format: "bool",
				initialValue: false,
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Identify Accessory",
				designedMaxLength: 1
			}]
		}, {
			sType: types.LIGHTBULB_STYPE,
			characteristics: [{
				cType: types.NAME_CTYPE,
				onUpdate: null,
				perms: ["pr"],
				format: "string",
				initialValue: this.name,
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Name of service",
				designedMaxLength: 255
			}, {
				cType: types.POWER_STATE_CTYPE,
				onUpdate: function(value) {
					that.setPowerState(value);
				},
				perms: ["pw", "pr", "ev"],
				format: "bool",
				initialValue: false,
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Turn on the light",
				designedMaxLength: 1
			}, {
				cType: types.BRIGHTNESS_CTYPE,
				onUpdate: function(value) {
					that.setBrightnessLevel(value);
				},
				perms: ["pw", "pr", "ev"],
				format: "bool",
				initialValue: 100,
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Adjust brightness of light",
				designedMinValue: 0,
				designedMaxValue: 100,
				designedMinStep: 1,
				unit: "%"
			}]
		}];
		if (that.type == "rgbw" || that.type == "rgb") {
			services[1].characteristics.push({
				cType: types.HUE_CTYPE,
				onUpdate: function(value) {
					that.setHue(value);
				},
				perms: ["pw", "pr", "ev"],
				format: "int",
				initialValue: 0,
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Adjust Hue of Light",
				designedMinValue: 0,
				designedMaxValue: 360,
				designedMinStep: 1,
				unit: "arcdegrees"
			});
		}
		return services;
	}
};

module.exports.accessory = MiLight;
