const options = {
  token: {
    key: "AuthKey_N3Z988DH6A.p8",
    keyId: "N3Z988DH6A",
    teamId: "8TS38292CF"
  },
  production: true
};
var apn = require("apn");

var apnProvider = new apn.Provider(options);

module.exports = {
  sendNotification: (deviceToken, message, payload) => {
    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    // note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = `\u2709 ${message}`;
    note.payload = payload;
    note.topic = "com.tribi.Tribi";

    apnProvider.send(note, deviceToken).then(result => {
      // see documentation for an explanation of result
      console.log(JSON.stringify(result));
    });
  }
};
