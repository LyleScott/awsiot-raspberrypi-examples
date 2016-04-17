var awsIot = require("aws-iot-device-sdk");

// Adapted from:
// https://raw.githubusercontent.com/sreid/aws-iot-raspberry-pi-how-to/master/pi.js

// Config here.
var thingName = "Raspine1",
    iface = "wlan0",  // can be eth0
    privateKeyPath = "../certs/547df7acb9-private.pem.key",
    certificatePath = "../certs/547df7acb9-certificate.pem.crt",
    caPath = "../certs/rootCA.pem",
    region = "us-east-1";

// Create a Thing Shadow so we can modify its state.
var thingShadows = awsIot.thingShadow({
  keyPath: privateKeyPath,
  certPath: certificatePath,
  caPath: caPath,
  clientId: thingName,
  region: region
});

var os = require("os");

// Get the IP of the configured (above) interface and create a state payload
// to send to AWS IoT
var thingState = {
  "state": {
    "reported": {
      "ip": os.networkInterfaces()[iface][0]["address"],
      "hostname": os.hostname(),
      "release": os.release()
    }
  }
}

// Setup Thing Shadow event handlers.
thingShadows.on("connect", function() {
  console.log("Connected and now Registering...");
  thingShadows.register( thingName );

  // An update right away causes a timeout error, so we wait about 2 seconds.
  setTimeout( function() {
    console.log("Updating IP address...");
    clientTokenIP = thingShadows.update(thingName, thingState);
    console.log("Update:"  +  clientTokenIP);
  }, 2500 );

  // Code below just logs messages for info/debugging.
  thingShadows.on("status",
    function(thingName, stat, clientToken, stateObject) {
       console.log("received " + stat + " on " + thingName + ": " + 
                   JSON.stringify(stateObject));
    });

  thingShadows.on("update",
      function(thingName, stateObject) {
         console.log("received update " + " on " + thingName + ": " + 
                     JSON.stringify(stateObject));
      });

  thingShadows.on("delta",
      function(thingName, stateObject) {
         console.log("received delta " + " on " + thingName + ": " + 
                     JSON.stringify(stateObject));
      });

  thingShadows.on("timeout",
      function(thingName, clientToken) {
         console.log("received timeout for " +  clientToken)
      });

  thingShadows
    .on("close", function() {
      console.log("close");
    });

  thingShadows
    .on("reconnect", function() {
      console.log("reconnect");
    });

  thingShadows
    .on("offline", function() {
      console.log("offline");
    });

  thingShadows
    .on("error", function(error) {
      console.log("error", error);
    });

});
