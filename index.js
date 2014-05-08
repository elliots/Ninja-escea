var escea_udp = require('./lib/escea_udp')
  , escea_switch = require('./lib/escea_switch')
  , escea_room = require('./lib/escea_room')
  , escea_target = require('./lib/escea_target')
  , escea_flameeffect = require('./lib/escea_flameeffect')
  , util = require('util')
  , stream = require('stream')
  , events = require('events');


// Give our driver a stream interface
util.inherits(escea, stream);

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
function escea(opts, app) {

  var self = this;
  this.first = true;
  this._opts = opts;

  console.log("start");

  app.on('client::up', function() {

    // The client is now connected to the Ninja Platform

    // Check if we have sent an announcement before.
    // If not, send one and save the fact that we have.

   if (self.first) {
      var eventemitter = new events.EventEmitter();
      var escea_comms = new escea_udp(eventemitter);
      self.em = eventemitter;
      self.escea_comms = escea_comms;
      escea_comms.discover();
      self.first = false;
    }

   self.em.on('Fireplace', function(serial){
          console.log("Serial = " + serial);
          self.emit('register', new escea_switch(self.escea_comms, self.em, serial));
          self.emit('register', new escea_flameeffect(serial, self.em));
          self.emit('register', new escea_room(serial, self.em));
          self.emit('register', new escea_target(serial, self.em));
    });

  });
}

// Export it
module.exports = escea;
