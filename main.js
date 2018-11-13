/**
 * SIMPLE GATT SERVER
 * name: ble_challenge
 * author: Felipe Santi
 * copyright: Sismotur 2017 (C) All Rights Reserved
 */

// requires
var bleno = require('bleno');
var crypto = require('./crypto_gatt');

// initial set up - max 21 chars due to BLE limit
var _nonceLength = 21;
var _beginStrChallenge = ':BEGIN:';
var _endStrChallenge = ':END:';
var _timeLimitMillis = 30000; // 60 seconds
var _mockChallengeSolution = "inventrip";

// parameters
var _timeStr;
var _timeStartMillis;
var _timeStopMillis;
var _timeElapsedMillis;
var _currentNonce;
var _fullChallenge;
var _POV;
var _POV_STATE;

// operation codes
var _POV_STATE_SUCCESS = 1;

// global methods

// resets the global variables
var reset_challenge = function() {
    console.log("*** RESET CHALLENGE ***");
    _POV = "";
    _POV_STATE = 0;
    _currentNonce = "";
    _fullChallenge = "";
    _timeStartMillis = new Date();
    _timeStopMillis = 0;
    _timeElapsedMillis = 0;
    _timeStr = new Date().toISOString();
}

// Advertise the BLE adrress when bleno start
bleno.on('stateChange', function(state) {
    console.log('State change: ' + state);
        if(state === 'poweredOn') {
        reset_challenge();
        bleno.startAdvertising('RaspberryPi',['12ab']);
        } else {
        bleno.stopAdvertising();
        }
});

// Log when accepting connections
bleno.on('accept', function(clientAddress) {
    console.log('Accepted connection from address: ' + clientAddress);
    console.log('Current GMT time: ' + _timeStr.replace(/T/,' '));
});

// Disconnect callback: reset the challenge
bleno.on('disconnect', function(clientAddress) {
    console.log('Disconnected from address: ' + clientAddress);
    reset_challenge();
});

// Create a new service and characteristic when advertising begins
bleno.on('advertisingStart', function(error) {
    if(error) {
        console.log("Advertising start error: " + error);
    } else {
        console.log("Advertising start success");
        bleno.setServices([
        // SERVICE PROOF OF VISIT
            new bleno.PrimaryService({
                uuid: 'ace0',
            characteristics: [
                // CHARACTERISTIC 1. Entry point - get a fresh random nonce
                new bleno.Characteristic({
                    value:null,
                    uuid:'0001',
                    properties: ['read'],
                    descriptors: [
                        new bleno.Descriptor({
                            uuid: '0001',
                            value: 'Proof of Visit entry: serves a nonce string'
                        })
                    ],
                    // on read request, send a message back with the Nonce and reset the challenge
                    onReadRequest: function(offset, callback) {
                        _currentNonce = crypto.nonce(_nonceLength); // generates random nonce
                        console.log("****************************************");
                        console.log("Proof of Visit read: nonce is: " + _currentNonce);
                        reset_challenge();
                        console.log('Current GMT time: ' + _timeStr.replace(/T/,' '));
                        console.log("Maximum time to solve the challenge is: " + 
                                (_timeLimitMillis / 1000).toString() + " seconds");
                        callback(this.RESULT_SUCCESS, new Buffer(_currentNonce));
                    }
                }),
                // CHARACTERISTIC 2. Receive and check client submission
                new bleno.Characteristic({
                    value:null,
                    uuid:'0002',
                    properties: ['write'],
                    descriptors: [
                        new bleno.Descriptor({
                            uuid: '0001',
                            value: 'Write here the challenge string'
                        })
                    ],
                    // on write request, log in the console the value
                    onWriteRequest: function(data, offset, withoutResponse, callback) {

                        // check the counter
                        _timeStopMillis = new Date();
                        _timeElapsedMillis = _timeStopMillis - _timeStartMillis
                        
                        // print the timer
                        console.log("****************************************");
                        console.log("Challenge submission");
                        console.log("Time elapsed : " + (_timeElapsedMillis / 1000).toString()); 

                        if(offset) {
                            callback(this.RESULT_ATTR_NOT_LONG);
                            console.log("Challenge string invalid (nil)");
                        } else if (_timeElapsedMillis > _timeLimitMillis) { 
                            console.log("Challenge timeout");
                            callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
                        } else if (_timeElapsedMillis = 0) {
                            console.log("Please get a Nonce first");
                            callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
                        } else if (_currentNonce = "") {
                            console.log("Please get a Nonce first");
                            callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
                        } else {
                            var _challenge_chunk = data.toString('utf-8');
                            console.log("Challenge string chunk: " + _challenge_chunk);
                            _fullChallenge += _challenge_chunk
                            console.log("Full challenge string chunk: " + _fullChallenge);
                                if (crypto.endsWith(_fullChallenge,':END:')) {
                                    console.log("Full challenge string submitted: " + _fullChallenge);
                                    // Check if the solution is ok  TODO: MOCK SOLUTION
                                    if (_fullChallenge === (_beginStrChallenge +  
                                                _mockChallengeSolution + _endStrChallenge)) {
                                        // challenge solved
                                        console.log("CHALLENGE SOLVED, CONGRATULATIONS!!!");
                                        console.log("Please subscribe to the notification service");
                                        _POV = "{pubkey:'12345',sig:'abcdef'}"
                                        _POV_STATE = _POV_STATE_SUCCESS;
                                    } else {
                                        // challenged failed
                                        console.log("Invalid solution");
                                    }
                                }
                            callback(this.RESULT_SUCCESS);
                        }
                    }
                }),
                // CHARACTERISTIC 3. Receive signed POV
                new bleno.Characteristic({
                    value:null,
                    uuid:'0003',
                    properties: ['notify'],
                    descriptors: [
                        new bleno.Descriptor({
                            uuid: '0001',
                            value: 'Receive here your POV notification'
                        })
                    ],
                    // on subscription request, log to the console
                    onSubscribe: function(maxValueSize, updateValueCallback) {
                        console.log("****************************************");
                        console.log("Subscribed to the POV notification characteristic");
                        this.intervalId = setInterval(function() {
                            // Send the POV once it is available
                            if (_POV_STATE == _POV_STATE_SUCCESS) {
                                console.log("Notification value is: " + _POV);
                                updateValueCallback(new Buffer(_POV.toString('utf-8')));
                            }
                        },1000)
                    },
                    // on unsubscriptioni, log into the console
                    onUnsubscribe: function(offset, callback) {
                        clearInterval(this.intervalId);
                        console.log("Unsubscribed to the POV notification characteristic");
                    }
                })
            ]
        })
        ])
    }
});
