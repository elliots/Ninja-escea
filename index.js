var escea_udp = require('./lib/escea_udp')
  , escea_switch = require ('./lib/escea_switch')
  , escea_room = require('./lib/escea_room')
  , escea_target = require('./lib/escea_target')
  , util = require('util')
  , stream = require('stream')
  , events = require('events'); 
  

// Give our driver a stream interface
util.inherits(escea,stream);

// Our greeting to the user.


/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default driver configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the Ninja Platform
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the Ninja Platform
 */
function escea(opts,app) {

  var self = this;
  this.first = true;
  this._opts = opts;
  
  console.log("start");

  app.on('client::up',function(){

    // The client is now connected to the Ninja Platform

    // Check if we have sent an announcement before.
    // If not, send one and save the fact that we have.
    var escea_comms = new escea_udp;
    
     processFires = function(serial) {
             console.log("Serial = " + serial);
             var eventemitter = new events.EventEmitter();
             self.emit('register', new escea_switch(escea_comms,eventemitter,serial));
             self.emit('register', new escea_room(serial,eventemitter));
             self.emit('register', new escea_target(serial,eventemitter));
      }
   
     if (self.first) {
               escea_comms.discover(processFires);
               self.first = false;
     }          
  });
};

// Export it
module.exports = escea;