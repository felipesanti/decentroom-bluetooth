/**
 * SIMPLE LED CONTROLLER FOR RASPBERRY PI
 * name: leds.js
 * author:
 * - https://github.com/jperkin/node-rpio
 * - modified by Felipe Santi and Enrique Melero
 * how to use:
 * $ node leds.js [green | yellow | red | all]
 */

// requires
var rpio = require('rpio');

// initial setup
var greenLed = 37; // GPIO26
var yellowLed = 35; // GPIO19
var redLed = 33; // GPIO 13

rpio.open(greenLed, rpio.OUTPUT, rpio.LOW);
rpio.open(yellowLed, rpio.OUTPUT, rpio.LOW);
rpio.open(redLed, rpio.OUTPUT, rpio.LOW);

// create a generic function to blink a Led 5 times
var blinkLed = function(pin) {
	for (var i = 0; i < 5; i++) {
		// on for 1 second (1000 ms)
		rpio.write(pin, rpio.HIGH);
		rpio.msleep(1000);

		// off for 3/4 second (500 ms)
		rpio.write(pin, rpio.LOW);
		rpio.msleep(750);
	};
	console.log('BLINK FINISHED');
};

// read from the command line which led to blink
var ledToBlink = process.argv[2];
if (ledToBlink === undefined) {
	console.error('ERROR: missing led to blink [green | yellow | red | all]');
} else {
	switch(ledToBlink) {
		case 'green':
			blinkLed(greenLed);
			break;
		case 'yellow':
			blinkLed(yellowLed);
			break;
		case 'red':
			blinkLed(redLed);
			break;
		case 'all':
			blinkLed(greenLed);
			blinkLed(yellowLed);
			blinkLed(redLed);
		default:
			console.error('ERROR: led to blink must be [green | yellow | red | all]');

	}
};


