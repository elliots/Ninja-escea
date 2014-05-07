var stream = require('stream')
  , dgram = require('dgram')
  , util = require('util');

// Give our device a stream interface
util.inherits(Escea_udp, stream);

// Export it
module.exports = Escea_udp;


function Escea_udp(notify) {
  var self = this;
  this.notifier = notify
  this.client = dgram.createSocket('udp4');
  firelist = new Array();
  this.firelist = firelist;
  this.client.bind(3300, function() {

    self.client.setBroadcast(true);

    self.client.on("message", function(msg, rinfo) {

      if (msg[1] == 0x90) {
        var item = {ipaddress:rinfo.address , serial:msg.readUInt32BE(3,false),
                                    pin:msg.readUInt16BE(7,false) };
        firelist.push(item);

        self.notifier.emit("Fireplace",item.serial);
      }
      if (msg[1] == 0x80) {
        var serial;       
        self.firelist.forEach(function(entry) {
                if (entry.ipaddress == rinfo.address) { serial = entry.serial };
        });  
        self.notifier.emit(serial+"Roomtemp",msg[8]);
        self.notifier.emit(serial+"Targettemp",msg[7]); 
        self.notifier.emit(serial+"State",msg[4]); 
      }
      if (msg[1] == 0x8D) {
         var serial;
         self.firelist.forEach(function(entry) {
                if (entry.ipaddress == rinfo.address) { serial = entry.serial };
        });

        self.notifier.emit(serial+"State",true);
      }
      if (msg[1] == 0x8F) {
        var serial;
         self.firelist.forEach(function(entry) {
                if (entry.ipaddress == rinfo.address) { serial = entry.serial };
        });

        self.notifier.emit(serial+"State",false)
      }
    });
  });


}

Escea_udp.prototype.processMessage = function(ipa, message) {
  var self = this;

  self.client.send(message, 0, message.length, 3300, ipa, function(err, bytes) {
    if (err) throw err;
  });

};

Escea_udp.prototype.discover = function() {
  var self = this;
  var ip = "255.255.255.255";
  var message = new Buffer(16);

  message[0] = 0x47;
  message[1] = 0x50;
  for (var i = 2; i < 14; i++) {
    message[i] = 0x00;
  }
  message[14] = 0x50;
  message[15] = 0x46;
  this.processMessage(ip, message);
};


Escea_udp.prototype.queryfire = function(fire) {
  var self = this;
  var message = new Buffer(16);
  var ipa; 
  message[0] = 0x47;
  message[1] = 0x31;
  for (var i = 2; i < 14; i++) {
    message[i] = 0x00;
  }
  message[14] = 0x31;
  message[15] = 0x46;

  this.firelist.forEach(function(entry) {
                              if (entry.serial == fire) { ipa = entry.ipaddress};
                        });
  this.processMessage(ipa, message)

  //   var fire.state = false;
};

Escea_udp.prototype.controlfire = function(fire, state) {
  var self = this;
  var message = new Buffer(16);
  var fs = 0x39;
  var ipa;

  console.log("Control fire " + state);
  if (state == 0) {
    fs = 0x3A;
  }
  message[0] = 0x47;
  message[1] = fs; //turn off
  for (var i = 2; i < 14; i++) {
    message[i] = 0x00;
  }
  message[14] = fs;
  message[15] = 0x46;
  this.firelist.forEach(function(entry) {
        if (entry.serial == fire) { ipa = entry.ipaddress};
  })
  this.processMessage(ipa, message)

};

