var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-thermostat", "Thermostat", Thermostat);
}


function Thermostat(log, config) {
	this.log = log;

    this.username = config["username"] || "username";
    this.password = config["password"] || "password";
	this.name = config["name"];
	this.log(this);
}

Thermostat.prototype = {

	httpRequest: function(url, body, method, username, password, sendimmediately, callback) {
		request({
				url: url,
				form: {username:username, password:password},
				method: method,
				//headers: {
				//	user: username,
				//	pass: password,
				//	sendImmediately: sendimmediately
				//}
			},
			function(error, response, body) {
				var obj = JSON.parse(body);
				callback(obj.token);
				//callback(error, response, body)
			})
	},
	httpRequestSetTemp: function(url, body, method, username, password, sendimmediately, callback) {
		var temp = body;
		request({
				url: url,
				form: {username:username, password:password},
				method: method,
				//headers: {
				//	user: username,
				//	pass: password,
				//	sendImmediately: sendimmediately
				//}
			},
			function(error, response, body) {
				var obj = JSON.parse(body);
				console.log(obj.token);

				request({
						url: 'https://portal.icy.nl/data',
						form: {temperature1:temp, uid:obj.serialthermostat1},
						method: method,
						headers: {
							'Session-token': obj.token
						}
					},
					function(error, response, body) {
						//var obj = JSON.parse(body);
						//callback(error, response, body)
					})

				//callback(error, response, body)
			})
	},
	//Start
	identify: function(callback) {
		this.log("Identify requested!");
		callback(null);
	},
	// Required
	getCurrentHeatingCoolingState: function(callback) {
		this.log("getCurrentHeatingCoolingState");
		callback(10);
	},
	setTargetHeatingCoolingState: function(value, callback) {
		this.log("setTargetHeatingCoolingState");
		callback(null, value);
	},
	getCurrentTemperature: function(callback) {

		request({
				url: 'https://portal.icy.nl/login',
				form: {username:this.username, password:this.password},
				method: 'POST',
				//headers: {
				//	'Session-token': username
				//}
			},
			function(error, response, body) {
				var obj = JSON.parse(body);
				console.log(obj.token);

				request({
						url: 'https://portal.icy.nl/data',
						method: 'GET',
						headers: {
							'Session-token': obj.token
						}
					},
					function(error, response, body) {
						var obj = JSON.parse(body);
						console.log(body);
						//var obj = JSON.parse(body);
						callback(null,obj.temperature2)
					})

				//callback(error, response, body)
			})


		//this.log("getCurrentTemperature");
		//callback(null,11);
	},
	setTargetTemperature: function(value, callback) {

		this.httpRequestSetTemp("https://portal.icy.nl/login",value,'POST',this.username,this.password,'','');

		this.log("setTargetTemperature");
		callback(null, value);
	},
	getTemperatureDisplayUnits: function(callback) {
		this.log("getTemperatureDisplayUnits");
		callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS);
	},

	// Optional
	getCurrentRelativeHumidity: function(callback) {
		this.log("getCurrentRelativeHumidity");
		callback(12);
	},
	setTargetRelativeHumidity: function(value, callback) {
		this.log("setTargetRelativeHumidity");
		callback(null, value);
	},
	getCoolingThresholdTemperature: function(callback) {
		this.log("getCoolingThresholdTemperature");
		callback(null, 13);
	},
	getHeatingThresholdTemperature: function(callback) {
		this.log("getHeatingThresholdTemperature");
		callback(null, 14);
	},
	getName: function(callback) {
		this.log("getName");
		callback(null, this.name);
	},

	getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "HTTP Manufacturer")
			.setCharacteristic(Characteristic.Model, "HTTP Model")
			.setCharacteristic(Characteristic.SerialNumber, "HTTP Serial Number");

			var thermostatService = new Service.Thermostat(this.name);

			// Required Characteristics
			thermostatService
				.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
				.on('get', this.getCurrentHeatingCoolingState.bind(this));

			thermostatService
				.getCharacteristic(Characteristic.TargetHeatingCoolingState)
				.on('set', this.setTargetHeatingCoolingState.bind(this));

			thermostatService
				.getCharacteristic(Characteristic.CurrentTemperature)
				.on('get', this.getCurrentTemperature.bind(this));

			thermostatService
				.getCharacteristic(Characteristic.TargetTemperature)
				.on('set', this.setTargetTemperature.bind(this));

			thermostatService
				.getCharacteristic(Characteristic.TemperatureDisplayUnits)
				.on('get', this.getTemperatureDisplayUnits.bind(this));

			// Optional Characteristics
			thermostatService
				.getCharacteristic(Characteristic.CurrentRelativeHumidity)
				.on('get', this.getCurrentRelativeHumidity.bind(this));

			thermostatService
				.getCharacteristic(Characteristic.CurrentRelativeHumidity)
				.on('set', this.setTargetRelativeHumidity.bind(this));

			thermostatService
				.getCharacteristic(Characteristic.CoolingThresholdTemperature)
				.on('get', this.getCoolingThresholdTemperature.bind(this));

			thermostatService
				.getCharacteristic(Characteristic.CoolingThresholdTemperature)
				.on('get', this.getHeatingThresholdTemperature.bind(this));

			thermostatService
				.getCharacteristic(Characteristic.Name)
				.on('get', this.getName.bind(this));

			return [informationService, thermostatService];
		}
};
