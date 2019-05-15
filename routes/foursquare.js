const request = require("request");
var rp = require("request-promise");
var express = require("express");
var router = express.Router();
// Models
var User = require("../models/user");
var Group = require("../models/group");
var GroupRequest = require("../models/grouprequest");

var constants = require("../config/constants");
var gcm = require("node-gcm");
// var push_sender = new gcm.Sender(constants.fcm_server_key);
var mailgun = require("mailgun-js")({
  apiKey: constants.mailgun.api_key,
  domain: constants.mailgun.DOMAIN
});
var twilio = require("twilio");
var twilioclient = new twilio(
  constants.twilio.accountSid,
  constants.twilio.authToken
);

var push = require("../config/push_notification");

var Mixpanel = require("mixpanel");
var mixpanel = Mixpanel.init("37ce63f0126b1775a23b5e3facd16807");
var exclude_category = [
  "4bf58dd8d48988d16e941735", // fast food restaurant
  "4bf58dd8d48988d1e0931735", // Coffee Shop
  "52f2ab2ebcbc57f1066b8b4a",
  "54541b70498ea6ccd0204bff",
  "4f4530164b9074f6e4fb00ff",
  "52f2ab2ebcbc57f1066b8b4e",
  "52f2ab2ebcbc57f1066b8b4d",
  "4bf58dd8d48988d130951735",
  "53fca564498e1a175f32528b",
  "4bf58dd8d48988d1f9931735",
  "4bf58dd8d48988d1ef941735",
  "52f2ab2ebcbc57f1066b8b53",
  "56aa371be4b08b9a8d57353e",
  "4e74f6cabd41c4836eac4c31",
  "4f2a23984b9023bd5841ed2c",
  "52f2ab2ebcbc57f1066b8b4c",
  "4bf58dd8d48988d1fa931735",
  "4bf58dd8d48988d1f8931735",
  "4f4530a74b9074f6e4fb0100",
  "4bf58dd8d48988d1ee931735",
  "4bf58dd8d48988d132951735",
  "4bf58dd8d48988d1fb931735",
  "4bf58dd8d48988d12f951735",
  "4bf58dd8d48988d133951735",
  "56aa371be4b08b9a8d5734e1",
  "4bf58dd8d48988d1f6931735",
  "589ddde98ae3635c072819ee",
  "52f2ab2ebcbc57f1066b8b50",
  "52f2ab2ebcbc57f1066b8b4f",
  "4bf58dd8d48988d12b951735",
  "52f2ab2ebcbc57f1066b8b4b",
  "5744ccdfe4b0c0459246b4e8",
  "4bf58dd8d48988d1f7931735",
  "5744ccdfe4b0c0459246b4e5",
  "4bf58dd8d48988d1ec931735",
  "56aa371be4b08b9a8d57352f",
  "4bf58dd8d48988d1f0931735",
  "4bf58dd8d48988d1ef931735",
  "52f2ab2ebcbc57f1066b8b2e",
  "52e816a6bcbc57f1066b7a54",
  "4bf58dd8d48988d126951735",
  "4bf58dd8d48988d10b951735",
  "56aa371be4b08b9a8d57355c",
  "4f04b08c2fb6e1c99f3db0bd",
  "4bf58dd8d48988d1f3941735",
  "4bf58dd8d48988d1de931735",
  "5032781d91d4c4b30a586d5b",
  "5744ccdfe4b0c0459246b4cd",
  "4f04b1572fb6e1c99f3db0bf",
  "52f2ab2ebcbc57f1066b8b21",
  "52f2ab2ebcbc57f1066b8b1b",
  "4bf58dd8d48988d123951735",
  "56aa371be4b08b9a8d573566",
  "52f2ab2ebcbc57f1066b8b39",
  "52f2ab2ebcbc57f1066b8b1f",
  "58daa1558bbb0b01f18ec1ae",
  "56aa371be4b08b9a8d573552",
  "4f4531084b9074f6e4fb0101",
  "5032885091d4c4b30a586d66",
  "5744ccdfe4b0c0459246b4c4",
  "52f2ab2ebcbc57f1066b8b28",
  "554a5e17498efabeda6cc559",
  "4eb1bdde3b7b55596b4a7490",
  "4bf58dd8d48988d10f951735",
  "4bf58dd8d48988d100951735",
  "5032897c91d4c4b30a586d69",
  "52f2ab2ebcbc57f1066b8b23",
  "4bf58dd8d48988d121951735",
  "52f2ab2ebcbc57f1066b8b2f",
  "4d954afda243a5684865b473",
  "5ae95d208a6f17002ce792b2",
  "4f04ad622fb6e1c99f3db0b9",
  "56aa371be4b08b9a8d57354a",
  "4f04afc02fb6e1c99f3db0bc",
  "4bf58dd8d48988d1ff941735",
  "58daa1558bbb0b01f18ec206",
  "52f2ab2ebcbc57f1066b8b27",
  "52f2ab2ebcbc57f1066b8b29",
  "52f2ab2ebcbc57f1066b8b38",
  "52f2ab2ebcbc57f1066b8b1e",
  "52f2ab2ebcbc57f1066b8b2b",
  "52f2ab2ebcbc57f1066b8b3f",
  "4bf58dd8d48988d1fc941735",
  "52f2ab2ebcbc57f1066b8b33",
  "52f2ab2ebcbc57f1066b8b25",
  "58daa1558bbb0b01f18ec1b4",
  "4bf58dd8d48988d111951735",
  "58daa1558bbb0b01f18ec1f1",
  "52f2ab2ebcbc57f1066b8b36",
  "50aaa5234b90af0d42d5de12",
  "545419b1498ea6ccd0202f58",
  "52f2ab2ebcbc57f1066b8b2c",
  "54541900498ea6ccd0202697",
  "4bf58dd8d48988d112951735",
  "52f2ab2ebcbc57f1066b8b19",
  "4bf58dd8d48988d128951735",
  "4bf58dd8d48988d113951735",
  "55888a5a498e782e3303b43a",
  "4bf58dd8d48988d1f8941735",
  "52f2ab2ebcbc57f1066b8b1c",
  "52f2ab2ebcbc57f1066b8b46",
  "53e0feef498e5aac066fd8a9",
  "56aa371be4b08b9a8d573564",
  "52f2ab2ebcbc57f1066b8b45",
  "4bf58dd8d48988d186941735",
  "50aa9e744b90af0d42d5de0e",
  "4bf58dd8d48988d118951735",
  "4bf58dd8d48988d1f5941735",
  "56aa371be4b08b9a8d573550",
  "4bf58dd8d48988d10e951735",
  "58daa1558bbb0b01f18ec1ca",
  "4bf58dd8d48988d11e951735",
  "4bf58dd8d48988d11d951735",
  "5370f356bcbc57f1066c94c2",
  "4bf58dd8d48988d11b951735",
  "56aa371be4b08b9a8d573505",
  "52f2ab2ebcbc57f1066b8b16",
  "52f2ab2ebcbc57f1066b8b3a",
  "503287a291d4c4b30a586d65",
  "52f2ab2ebcbc57f1066b8b26",
  "5454152e498ef71e2b9132c6",
  "56aa371be4b08b9a8d573554",
  "4bf58dd8d48988d122951735",
  "5032872391d4c4b30a586d64",
  "52f2ab2ebcbc57f1066b8b1d",
  "5745c2e4498e11e7bccabdbd",
  "52f2ab2ebcbc57f1066b8b1a",
  "52dea92d3cf9994f4e043dbb",
  "4bf58dd8d48988d1f6941735",
  "5744ccdfe4b0c0459246b4be",
  "5032850891d4c4b30a586d62",
  "4d954b0ea243a5684a65b473",
  "5454144b498ec1f095bff2f2",
  "4f4532974b9074f6e4fb0104",
  "5744ccdfe4b0c0459246b4c7",
  "52f2ab2ebcbc57f1066b8b2d",
  "52f2ab2ebcbc57f1066b8b2a",
  "4f04ae1f2fb6e1c99f3db0ba",
  "4eb1bdf03b7b55596b4a7491",
  "5453de49498eade8af355881",
  "4bf58dd8d48988d115951735",
  "52f2ab2ebcbc57f1066b8b42",
  "52f2ab2ebcbc57f1066b8b40",
  "52e81612bcbc57f1066b7a27",
  "4bf58dd8d48988d10a951735",
  "52f2ab2ebcbc57f1066b8b32",
  "4bf58dd8d48988d124951735",
  "56aa371be4b08b9a8d5734d3",
  "52f2ab2ebcbc57f1066b8b44",
  "4eb1c1623b7b52c0e1adc2ec",
  "52f2ab2ebcbc57f1066b8b43",
  "4bf58dd8d48988d127951735",
  "5267e446e4b0ec79466e48c4",
  "52f2ab2ebcbc57f1066b8b56",
  "52f2ab2ebcbc57f1066b8b55",
  "4d954b06a243a5684965b473",
  "4f2a210c4b9023bd5841ed28",
  "4bf58dd8d48988d103941735",
  "5032891291d4c4b30a586d68",
  "4e67e38e036454776db1fb3a",
  "56aa371be4b08b9a8d5734c5",
  "58daa1558bbb0b01f18ec1ac",
  "52e81612bcbc57f1066b7a36",
  "4cae28ecbf23941eb1190695",
  "52e81612bcbc57f1066b7a31",
  "56aa371be4b08b9a8d5734f6",
  "4bf58dd8d48988d13a941735",
  "4bf58dd8d48988d139941735",
  "4eb1d80a4b900d56c88a45ff",
  "52e81612bcbc57f1066b7a41",
  "4bf58dd8d48988d138941735",
  "52e81612bcbc57f1066b7a40",
  "5744ccdfe4b0c0459246b4ac",
  "52e81612bcbc57f1066b7a3f",
  "56aa371be4b08b9a8d5734fc",
  "4bf58dd8d48988d132941735",
  "58daa1558bbb0b01f18ec1eb",
  "52e81612bcbc57f1066b7a3e",
  "4bf58dd8d48988d131941735",
  "52e81612bcbc57f1066b7a44",
  "52e81612bcbc57f1066b7a47",
  "52e81612bcbc57f1066b7a46",
  "52e81612bcbc57f1066b7a45",
  "4f4533814b9074f6e4fb0107",
  "4f04b10d2fb6e1c99f3db0be",
  "4f4533814b9074f6e4fb0106",
  "52e81612bcbc57f1066b7a48",
  "4bf58dd8d48988d13d941735",
  "52e81612bcbc57f1066b7a49",
  "4f4533804b9074f6e4fb0105",
  "52e81612bcbc57f1066b7a42",
  "58daa1558bbb0b01f18ec200",
  "52e81612bcbc57f1066b7a43",
  "56aa371ce4b08b9a8d573570",
  "4bf58dd8d48988d13b941735",
  "58daa1558bbb0b01f18ec1b2",
  "52f2ab2ebcbc57f1066b8b57",
  "5032856091d4c4b30a586d63",
  "5310b8e5bcbc57f1066bcbf1",
  "58daa1548bbb0b01f18ec1a9",
  "4bf58dd8d48988d172941735",
  "4c38df4de52ce0d596b336e1",
  "4bf58dd8d48988d125941735",
  "5665c7b9498e7d8a4f2c0f06",
  "54f4ba06498e2cf5561da814",
  "5665ef1d498ec706735f0e59",
  "4bf58dd8d48988d127941735",
  "5032764e91d4c4b30a586d5a",
  "52e81612bcbc57f1066b7a3d",
  "4bf58dd8d48988d124941735",
  "50328a8e91d4c4b30a586d6c",
  "4e52adeebd41615f56317744",
  "4d954af4a243a5684765b473",
  "56aa371be4b08b9a8d573526",
  "56aa371be4b08b9a8d57351d",
  "5744ccdfe4b0c0459246b4af",
  "58daa1558bbb0b01f18ec1d0",
  "52e81612bcbc57f1066b7a39",
  "4f4531b14b9074f6e4fb0103",
  "56aa371be4b08b9a8d5734ff",
  "58daa1558bbb0b01f18ec1f7",
  "4bf58dd8d48988d196941735",
  "522e32fae4b09b556e370f19",
  "4bf58dd8d48988d194941735",
  "4bf58dd8d48988d177941735",
  "4bf58dd8d48988d178941735",
  "52e81612bcbc57f1066b7a3a",
  "52e81612bcbc57f1066b7a3c",
  "52e81612bcbc57f1066b7a3b",
  "4bf58dd8d48988d104941735",
  "5744ccdfe4b0c0459246b4d6",
  "56aa371be4b08b9a8d5734d7",
  "52e81612bcbc57f1066b7a38",
  "4bf58dd8d48988d12e941735",
  "4bf58dd8d48988d12c941735",
  "4bf58dd8d48988d12c951735",
  "4bf58dd8d48988d12b941735",
  "4bf58dd8d48988d129941735",
  "4bf58dd8d48988d126941735",
  "4bf58dd8d48988d12a941735",
  "4f4534884b9074f6e4fb0174",
  "4eb1bea83b7b6f98df247e06",
  "56aa371be4b08b9a8d57356a",
  "4bf58dd8d48988d171941735",
  "52e81612bcbc57f1066b7a37",
  "4e0e22f5a56208c4ea9a85a0",
  "52e81612bcbc57f1066b7a32",
  "4bf58dd8d48988d100941735",
  "4bf58dd8d48988d1ff931735",
  "56aa371be4b08b9a8d573517",
  "4bf58dd8d48988d130941735",
  "56aa371be4b08b9a8d5734cf",
  "4bf58dd8d48988d173941735",
  "4d4b7105d754a06375d81259",
  "4fbc1be21983fc883593e321",
  "52e81612bcbc57f1066b7a24",
  "52e81612bcbc57f1066b7a10",
  "530e33ccbcbc57f1066bbff9",
  "530e33ccbcbc57f1066bbff3",
  "530e33ccbcbc57f1066bbff8",
  "4f2a25ac4b909258e854f55f",
  "530e33ccbcbc57f1066bbff7",
  "5345731ebcbc57f1066c39b2",
  "50aa9e094b90af0d42d5de0d",
  "530e33ccbcbc57f1066bbfe4",
  "4eb1baf03b7b2c5b1d4306ca",
  "56aa371be4b08b9a8d573541",
  "4eb1d4dd4b900d56c88a45fd",
  "4bf58dd8d48988d1e7941735",
  "52e81612bcbc57f1066b7a14",
  "4bf58dd8d48988d161941735",
  "50aaa4314b90af0d42d5de10",
  "5744ccdfe4b0c0459246b4b5",
  "4bf58dd8d48988d160941735",
  "4bf58dd8d48988d1e0941735",
  "4bf58dd8d48988d15a941735",
  "56aa371be4b08b9a8d573547",
  "52e81612bcbc57f1066b7a23",
  "52e81612bcbc57f1066b7a0f",
  "4bf58dd8d48988d15f941735",
  "4bf58dd8d48988d15b941735",
  "4bf58dd8d48988d1e5941735",
  "52e81612bcbc57f1066b7a12",
  "4bf58dd8d48988d15c941735",
  "56aa371be4b08b9a8d573511",
  "56aa371be4b08b9a8d573562",
  "56aa371be4b08b9a8d57353b",
  "4bf58dd8d48988d1df941735",
  "52e81612bcbc57f1066b7a22",
  "52e81612bcbc57f1066b7a30",
  "56aa371be4b08b9a8d573544",
  "52e81612bcbc57f1066b7a28",
  "4bf58dd8d48988d1d6941735",
  "4bf58dd8d48988d1d8941735",
  "4bf58dd8d48988d1ad941735",
  "4bf58dd8d48988d141941735",
  "4bf58dd8d48988d1b3941735",
  "4bf58dd8d48988d1a6941735",
  "4bf58dd8d48988d1a0941735",
  "4bf58dd8d48988d1a1941735",
  "4bf58dd8d48988d197941735",
  "5267e4d9e4b0ec79466e48c8"
];
var excludeNearby = [
  "52f2ab2ebcbc57f1066b8b4a",
  "54541b70498ea6ccd0204bff",
  "52f2ab2ebcbc57f1066b8b51",
  "4bf58dd8d48988d12a951735",
  "4f4531504b9074f6e4fb0102",
  "4bf58dd8d48988d129951735",
  "4f4530164b9074f6e4fb00ff",
  "52f2ab2ebcbc57f1066b8b4e",
  "52f2ab2ebcbc57f1066b8b4d",
  "4bf58dd8d48988d130951735",
  "53fca564498e1a175f32528b",
  "4bf58dd8d48988d1f9931735",
  "4bf58dd8d48988d1ef941735",
  "52f2ab2ebcbc57f1066b8b53",
  "56aa371be4b08b9a8d57353e",
  "4e74f6cabd41c4836eac4c31",
  "4f2a23984b9023bd5841ed2c",
  "4bf58dd8d48988d1fd931735",
  "4bf58dd8d48988d1fc931735",
  "52f2ab2ebcbc57f1066b8b4c",
  "4bf58dd8d48988d1fa931735",
  "4bf58dd8d48988d1f8931735",
  "4f4530a74b9074f6e4fb0100",
  "4bf58dd8d48988d1ee931735",
  "4bf58dd8d48988d132951735",
  "4bf58dd8d48988d1fb931735",
  "4bf58dd8d48988d12f951735",
  "4bf58dd8d48988d133951735",
  "56aa371be4b08b9a8d5734e1",
  "56aa371ce4b08b9a8d57356e",
  "4bf58dd8d48988d1f6931735",
  "589ddde98ae3635c072819ee",
  "55077a22498e5e9248869ba2",
  "52f2ab2ebcbc57f1066b8b50",
  "52f2ab2ebcbc57f1066b8b4f",
  "4bf58dd8d48988d12b951735",
  "4bf58dd8d48988d1fe931735",
  "52f2ab2ebcbc57f1066b8b4b",
  "4bf58dd8d48988d12d951735",
  "5744ccdfe4b0c0459246b4c1",
  "4e4c9077bd41f78e849722f9",
  "5744ccdfe4b0c0459246b4e8",
  "4bf58dd8d48988d1f7931735",
  "5744ccdfe4b0c0459246b4e5",
  "4bf58dd8d48988d1ec931735",
  "4bf58dd8d48988d1eb931735",
  "56aa371be4b08b9a8d57352f",
  "4eb1bc533b7b2c5b1d4306cb",
  "4bf58dd8d48988d1f0931735",
  "4bf58dd8d48988d1ef931735",
  "4bf58dd8d48988d1ed931735",
  "52f2ab2ebcbc57f1066b8b2e",
  "52e816a6bcbc57f1066b7a54",
  "4bf58dd8d48988d126951735",
  "4bf58dd8d48988d10b951735",
  "56aa371be4b08b9a8d57355c",
  "4f04b08c2fb6e1c99f3db0bd",
  "4bf58dd8d48988d1f3941735",
  "4bf58dd8d48988d1de931735",
  "5032781d91d4c4b30a586d5b",
  "5744ccdfe4b0c0459246b4cd",
  "4f04b1572fb6e1c99f3db0bf",
  "52f2ab2ebcbc57f1066b8b21",
  "4bf58dd8d48988d1f2941735",
  "52f2ab2ebcbc57f1066b8b1b",
  "4bf58dd8d48988d123951735",
  "56aa371be4b08b9a8d573566",
  "52f2ab2ebcbc57f1066b8b39",
  "52f2ab2ebcbc57f1066b8b1f",
  "58daa1558bbb0b01f18ec1ae",
  "56aa371be4b08b9a8d573552",
  "4f4531084b9074f6e4fb0101",
  "5032885091d4c4b30a586d66",
  "5744ccdfe4b0c0459246b4c4",
  "52f2ab2ebcbc57f1066b8b28",
  "52f2ab2ebcbc57f1066b8b20",
  "554a5e17498efabeda6cc559",
  "4eb1bdde3b7b55596b4a7490",
  "4bf58dd8d48988d10f951735",
  "4bf58dd8d48988d100951735",
  "5032897c91d4c4b30a586d69",
  "52f2ab2ebcbc57f1066b8b23",
  "52f2ab2ebcbc57f1066b8b34",
  "4bf58dd8d48988d121951735",
  "52f2ab2ebcbc57f1066b8b2f",
  "4d954afda243a5684865b473",
  "5ae95d208a6f17002ce792b2",
  "4f04ad622fb6e1c99f3db0b9",
  "56aa371be4b08b9a8d57354a",
  "4f04afc02fb6e1c99f3db0bc",
  "4bf58dd8d48988d1ff941735",
  "58daa1558bbb0b01f18ec206",
  "52f2ab2ebcbc57f1066b8b27",
  "52c71aaf3cf9994f4e043d17",
  "52f2ab2ebcbc57f1066b8b29",
  "52f2ab2ebcbc57f1066b8b38",
  "52f2ab2ebcbc57f1066b8b1e",
  "52f2ab2ebcbc57f1066b8b2b",
  "52f2ab2ebcbc57f1066b8b3f",
  "4bf58dd8d48988d1fc941735",
  "52f2ab2ebcbc57f1066b8b33",
  "52f2ab2ebcbc57f1066b8b25",
  "58daa1558bbb0b01f18ec1b4",
  "4bf58dd8d48988d111951735",
  "58daa1558bbb0b01f18ec1f1",
  "52f2ab2ebcbc57f1066b8b36",
  "50aaa5234b90af0d42d5de12",
  "545419b1498ea6ccd0202f58",
  "52f2ab2ebcbc57f1066b8b2c",
  "54541900498ea6ccd0202697",
  "4bf58dd8d48988d112951735",
  "52f2ab2ebcbc57f1066b8b19",
  "4bf58dd8d48988d128951735",
  "4bf58dd8d48988d113951735",
  "55888a5a498e782e3303b43a",
  "4bf58dd8d48988d1f8941735",
  "52f2ab2ebcbc57f1066b8b1c",
  "52f2ab2ebcbc57f1066b8b24",
  "52f2ab2ebcbc57f1066b8b46",
  "53e0feef498e5aac066fd8a9",
  "56aa371be4b08b9a8d573564",
  "52f2ab2ebcbc57f1066b8b45",
  "4bf58dd8d48988d186941735",
  "50aa9e744b90af0d42d5de0e",
  "4bf58dd8d48988d118951735",
  "4bf58dd8d48988d1f5941735",
  "56aa371be4b08b9a8d573550",
  "4bf58dd8d48988d10e951735",
  "58daa1558bbb0b01f18ec1ca",
  "4bf58dd8d48988d11e951735",
  "4bf58dd8d48988d11d951735",
  "5370f356bcbc57f1066c94c2",
  "4bf58dd8d48988d11b951735",
  "56aa371be4b08b9a8d573505",
  "52f2ab2ebcbc57f1066b8b16",
  "52f2ab2ebcbc57f1066b8b3a",
  "503287a291d4c4b30a586d65",
  "52f2ab2ebcbc57f1066b8b26",
  "5454152e498ef71e2b9132c6",
  "56aa371be4b08b9a8d573554",
  "4bf58dd8d48988d122951735",
  "5032872391d4c4b30a586d64",
  "52f2ab2ebcbc57f1066b8b1d",
  "5745c2e4498e11e7bccabdbd",
  "52f2ab2ebcbc57f1066b8b1a",
  "52dea92d3cf9994f4e043dbb",
  "4bf58dd8d48988d1f6941735",
  "5744ccdfe4b0c0459246b4be",
  "5032850891d4c4b30a586d62",
  "52f2ab2ebcbc57f1066b8b17",
  "4d954b0ea243a5684a65b473",
  "5454144b498ec1f095bff2f2",
  "4f4532974b9074f6e4fb0104",
  "5744ccdfe4b0c0459246b4c7",
  "52f2ab2ebcbc57f1066b8b2d",
  "52f2ab2ebcbc57f1066b8b2a",
  "4f04ae1f2fb6e1c99f3db0ba",
  "4eb1bdf03b7b55596b4a7491",
  "5453de49498eade8af355881",
  "4bf58dd8d48988d11a951735",
  "4bf58dd8d48988d115951735",
  "52f2ab2ebcbc57f1066b8b42",
  "52f2ab2ebcbc57f1066b8b40",
  "52e81612bcbc57f1066b7a27",
  "4bf58dd8d48988d10a951735",
  "52f2ab2ebcbc57f1066b8b32",
  "4bf58dd8d48988d124951735",
  "56aa371be4b08b9a8d5734d3",
  "52f2ab2ebcbc57f1066b8b44",
  "4eb1c1623b7b52c0e1adc2ec",
  "52f2ab2ebcbc57f1066b8b43",
  "4bf58dd8d48988d127951735",
  "5267e446e4b0ec79466e48c4",
  "52f2ab2ebcbc57f1066b8b56",
  "52f2ab2ebcbc57f1066b8b55",
  "4d954b06a243a5684965b473",
  "4f2a210c4b9023bd5841ed28",
  "4bf58dd8d48988d103941735",
  "5032891291d4c4b30a586d68",
  "4e67e38e036454776db1fb3a",
  "56aa371be4b08b9a8d5734c5",
  "58daa1558bbb0b01f18ec1ac",
  "52e81612bcbc57f1066b7a36",
  "4cae28ecbf23941eb1190695",
  "52e81612bcbc57f1066b7a31",
  "56aa371be4b08b9a8d5734f6",
  "4bf58dd8d48988d13a941735",
  "4bf58dd8d48988d139941735",
  "4eb1d80a4b900d56c88a45ff",
  "52e81612bcbc57f1066b7a41",
  "4bf58dd8d48988d138941735",
  "52e81612bcbc57f1066b7a40",
  "5744ccdfe4b0c0459246b4ac",
  "52e81612bcbc57f1066b7a3f",
  "56aa371be4b08b9a8d5734fc",
  "4bf58dd8d48988d132941735",
  "58daa1558bbb0b01f18ec1eb",
  "52e81612bcbc57f1066b7a3e",
  "4bf58dd8d48988d131941735",
  "52e81612bcbc57f1066b7a44",
  "52e81612bcbc57f1066b7a47",
  "52e81612bcbc57f1066b7a46",
  "52e81612bcbc57f1066b7a45",
  "4f4533814b9074f6e4fb0107",
  "4f04b10d2fb6e1c99f3db0be",
  "4f4533814b9074f6e4fb0106",
  "52e81612bcbc57f1066b7a48",
  "4bf58dd8d48988d13d941735",
  "52e81612bcbc57f1066b7a49",
  "4f4533804b9074f6e4fb0105",
  "52e81612bcbc57f1066b7a42",
  "58daa1558bbb0b01f18ec200",
  "52e81612bcbc57f1066b7a43",
  "56aa371ce4b08b9a8d573570",
  "4bf58dd8d48988d13b941735",
  "58daa1558bbb0b01f18ec1b2",
  "52f2ab2ebcbc57f1066b8b57",
  "5032856091d4c4b30a586d63",
  "5310b8e5bcbc57f1066bcbf1",
  "58daa1548bbb0b01f18ec1a9",
  "4bf58dd8d48988d172941735",
  "4c38df4de52ce0d596b336e1",
  "4bf58dd8d48988d125941735",
  "5665c7b9498e7d8a4f2c0f06",
  "54f4ba06498e2cf5561da814",
  "5665ef1d498ec706735f0e59",
  "4bf58dd8d48988d127941735",
  "5032764e91d4c4b30a586d5a",
  "52e81612bcbc57f1066b7a3d",
  "4bf58dd8d48988d124941735",
  "50328a8e91d4c4b30a586d6c",
  "4e52adeebd41615f56317744",
  "4d954af4a243a5684765b473",
  "56aa371be4b08b9a8d573526",
  "56aa371be4b08b9a8d57351d",
  "5744ccdfe4b0c0459246b4af",
  "58daa1558bbb0b01f18ec1d0",
  "52e81612bcbc57f1066b7a39",
  "4f4531b14b9074f6e4fb0103",
  "56aa371be4b08b9a8d5734ff",
  "58daa1558bbb0b01f18ec1f7",
  "4bf58dd8d48988d196941735",
  "522e32fae4b09b556e370f19",
  "4bf58dd8d48988d194941735",
  "4bf58dd8d48988d177941735",
  "4bf58dd8d48988d178941735",
  "52e81612bcbc57f1066b7a3a",
  "52e81612bcbc57f1066b7a3c",
  "52e81612bcbc57f1066b7a3b",
  "4bf58dd8d48988d104941735",
  "5744ccdfe4b0c0459246b4d6",
  "56aa371be4b08b9a8d5734d7",
  "52e81612bcbc57f1066b7a38",
  "4bf58dd8d48988d12e941735",
  "4bf58dd8d48988d12c941735",
  "4bf58dd8d48988d12c951735",
  "4bf58dd8d48988d12b941735",
  "4bf58dd8d48988d129941735",
  "4bf58dd8d48988d12a941735",
  "4bf58dd8d48988d126941735",
  "4f4534884b9074f6e4fb0174",
  "4eb1bea83b7b6f98df247e06",
  "56aa371be4b08b9a8d57356a",
  "4bf58dd8d48988d171941735",
  "52e81612bcbc57f1066b7a37",
  "4e0e22f5a56208c4ea9a85a0",
  "52e81612bcbc57f1066b7a32",
  "4bf58dd8d48988d100941735",
  "4bf58dd8d48988d1ff931735",
  "56aa371be4b08b9a8d573517",
  "4bf58dd8d48988d130941735",
  "56aa371be4b08b9a8d5734cf",
  "4bf58dd8d48988d173941735",
  "4d4b7105d754a06375d81259",
  "4fbc1be21983fc883593e321",
  "56aa371be4b08b9a8d5734c3",
  "52e81612bcbc57f1066b7a24",
  "4bf58dd8d48988d159941735",
  "52e81612bcbc57f1066b7a10",
  "530e33ccbcbc57f1066bbff9",
  "530e33ccbcbc57f1066bbff3",
  "530e33ccbcbc57f1066bbff8",
  "4f2a25ac4b909258e854f55f",
  "530e33ccbcbc57f1066bbff7",
  "5345731ebcbc57f1066c39b2",
  "50aa9e094b90af0d42d5de0d",
  "530e33ccbcbc57f1066bbfe4",
  "4eb1baf03b7b2c5b1d4306ca",
  "4eb1d4dd4b900d56c88a45fd",
  "56aa371be4b08b9a8d573541",
  "4bf58dd8d48988d1e7941735",
  "52e81612bcbc57f1066b7a14",
  "4bf58dd8d48988d161941735",
  "50aaa4314b90af0d42d5de10",
  "5744ccdfe4b0c0459246b4b5",
  "4bf58dd8d48988d160941735",
  "4bf58dd8d48988d1e0941735",
  "4bf58dd8d48988d15a941735",
  "56aa371be4b08b9a8d573547",
  "52e81612bcbc57f1066b7a23",
  "52e81612bcbc57f1066b7a0f",
  "4bf58dd8d48988d15f941735",
  "4bf58dd8d48988d15b941735",
  "4bf58dd8d48988d1e5941735",
  "52e81612bcbc57f1066b7a12",
  "4bf58dd8d48988d15c941735",
  "56aa371be4b08b9a8d573511",
  "56aa371be4b08b9a8d573562",
  "56aa371be4b08b9a8d57353b",
  "4bf58dd8d48988d1df941735",
  "52e81612bcbc57f1066b7a22",
  "52e81612bcbc57f1066b7a30",
  "56aa371be4b08b9a8d573544",
  "52e81612bcbc57f1066b7a28",
  "4bf58dd8d48988d1d6941735",
  "4bf58dd8d48988d1d8941735",
  "4bf58dd8d48988d1ae941735",
  "4bf58dd8d48988d1ad941735",
  "4bf58dd8d48988d1ab941735",
  "4bf58dd8d48988d141941735",
  "4bf58dd8d48988d1b3941735",
  "4bf58dd8d48988d1a6941735",
  "4bf58dd8d48988d1a8941735",
  "4bf58dd8d48988d1b0941735",
  "4bf58dd8d48988d1a2941735",
  "4bf58dd8d48988d1ac941735",
  "4bf58dd8d48988d1b6941735",
  "4e39a9cebd410d7aed40cbc4",
  "4bf58dd8d48988d1b7941735",
  "4bf58dd8d48988d1b5941735",
  "4bf58dd8d48988d1b8941735",
  "4bf58dd8d48988d1b9941735",
  "4bf58dd8d48988d1ba941735",
  "4bf58dd8d48988d1bb941735",
  "4bf58dd8d48988d1b4941735",
  "4bf58dd8d48988d1a3941735",
  "4bf58dd8d48988d1a9941735",
  "4bf58dd8d48988d1aa941735",
  "4bf58dd8d48988d1a7941735",
  "4bf58dd8d48988d1a5941735",
  "4bf58dd8d48988d1b2941735",
  "4bf58dd8d48988d1a0941735",
  "4bf58dd8d48988d1a1941735",
  "4bf58dd8d48988d1b1941735",
  "4bf58dd8d48988d1af941735",
  "4bf58dd8d48988d197941735",
  "4bf58dd8d48988d19f941735",
  "4bf58dd8d48988d19b941735",
  "4bf58dd8d48988d19c941735",
  "4bf58dd8d48988d19d941735",
  "4bf58dd8d48988d19e941735",
  "4bf58dd8d48988d19a941735",
  "4bf58dd8d48988d199941735",
  "4bf58dd8d48988d198941735",
  "4d4b7105d754a06372d81259",
  "5267e4d9e4b0ec79466e48c8"
];
function availableCategory(el) {
  if (el.categories.length == 0) return false;
  for (let i = 0; i < exclude_category.length; i++) {
    let exclude_term = exclude_category[i];
    for (let i = 0; i < el.categories.length; i++) {
      if (el.categories[i].id == exclude_term) {
        console.log("categories removed =>", el.name);
        return false;
      }
    }
  }
  return true;
}
function availableNearBy(el) {
  if (el.categories.length == 0) return false;
  for (let i = 0; i < excludeNearby.length; i++) {
    let exclude_term = excludeNearby[i];
    for (let i = 0; i < el.categories.length; i++) {
      if (el.categories[i].id == exclude_term) {
        console.log("categories removed =>", el.name);
        return false;
      }
    }
  }
  return true;
}
//  Venue management
router.post("/categories", function(req, res) {
  let ll = req.body.latlong;
  // let queries = ['Arts and Entertainment','College & University','Events','Food','Nightlife','Outdoors & Recreation','Shopping','Travel & Transport']
  let queries = [
    "4d4b7104d754a06370d81259",
    "4d4b7105d754a06372d81259",
    "4d4b7105d754a06373d81259",
    "4d4b7105d754a06374d81259",
    "4d4b7105d754a06376d81259",
    "4d4b7105d754a06377d81259",
    "4d4b7105d754a06378d81259",
    "4d4b7105d754a06379d81259"
  ];
  // queries = ['4d4b7105d754a06376d81259']
  let promises = [];

  for (let i = 0; i < queries.length; i++) {
    let temp = rp({
      url: "https://api.foursquare.com/v2/venues/search",
      method: "GET",
      qs: {
        client_id: constants.foursquare.ClientID,
        client_secret: constants.foursquare.ClientSecret,
        categoryId: queries[i],
        ll: ll,
        intent: "checkin",
        radius: 100000,
        limit: 50,
        v: "20180630"
      }
    });
    promises.push(temp);
  }
  Promise.all(promises)
    .then(function(data) {
      let result = [];
      for (let i = 0; i < data.length; i++) {
        let venues = JSON.parse(data[i]).response.venues;
        let filteredvenues = [];
        for (let j = 0; j < venues.length; j++) {
          let el = venues[j];
          if (availableCategory(el)) {
            let filtered = {
              id: el.id,
              name: el.name,
              latlng: {
                latitude: el.location.lat,
                longitude: el.location.lng
              }
            };
            filteredvenues.push(filtered);
          }
        }
        result.push(filteredvenues);
      }

      return res.json({ success: true, data: result });
    })
    .catch(e => {
      console.log(e);
      return res.json({ success: false, error: constants.errors.server_error });
    });
});

router.post("/popularvenues", function(req, res) {
  let ll = req.body.latlong;
  console.log("========> Venues near me ========>");
  console.log("params ll", ll);
  request(
    {
      url: "https://api.foursquare.com/v2/venues/explore",
      method: "GET",
      qs: {
        client_id: constants.foursquare.ClientID,
        client_secret: constants.foursquare.ClientSecret,
        ll: ll,
        v: "20180630",
        radius: 10000,
        limit: 50
      }
    },
    function(err, body) {
      if (err) {
        return res.json({
          success: false,
          error: constants.errors.server_error
        });
      } else {
        if (
          !JSON.parse(body.body).response.groups[0] ||
          !JSON.parse(body.body).response.groups[0].type
        ) {
          return res.json({ success: true, data: [] });
        }
        let result = [];
        let venues = JSON.parse(body.body).response.groups[0].items.map(
          elem => {
            return elem.venue;
          }
        );
        let filteredvenues = [];
        for (let j = 0; j < venues.length; j++) {
          let el = venues[j];
          if (availableNearBy(el) && availableCategory(el)) {
            let filtered = {
              id: el.id,
              name: el.name,
              latlng: {
                latitude: el.location.lat,
                longitude: el.location.lng
              }
            };
            filteredvenues.push(filtered);
          }
        }

        return res.json({ success: true, data: filteredvenues });
      }
    }
  );
});
router.post("/venuedetails", function(req, res) {
  let VENUE_ID = req.body.venue_id;
  request(
    {
      url: `https://api.foursquare.com/v2/venues/${VENUE_ID}`,
      method: "GET",
      qs: {
        client_id: constants.foursquare.ClientID,
        client_secret: constants.foursquare.ClientSecret,
        v: "20180630"
      }
    },
    function(err, body) {
      if (err) {
        return res.json({
          success: false,
          error: constants.errors.server_error
        });
      } else {
        let result = JSON.parse(body.body).response.venue;
        if (!result) {
          return res.json({
            success: false,
            error: {
              status: "quota_exceeded",
              message: JSON.parse(body.body).meta.errorDetail
            }
          });
        }
        let photos = [];
        for (let i = 0; i < result.photos.groups.length; i++) {
          for (let j = 0; j < result.photos.groups[i].items.length; j++) {
            let elem = result.photos.groups[i].items[j];
            let photo = {
              url: elem.prefix + elem.width + elem.suffix
            };
            photos.push(photo);
          }
        }
        let data = {
          id: result.id,
          name: result.name,
          phone: result.contact.phone,
          address: result.location.formattedAddress,
          hours: result.hours,
          category:
            result.categories.length > 0
              ? result.categories[0].name
              : "Undefined",
          description: result.description,
          photos: photos,
          tips: result.tips.groups[0].items.map(it => {
            return {
              text: it.text,
              agreeCount: it.agreeCount,
              disagreeCount: it.disagreeCount,
              createdAt: it.createdAt,
              user: it.user.firstName
            };
          }),
          latlng: {
            latitude: result.location.lat,
            longitude: result.location.lng
          }
        };
        return res.json({ success: true, data: data });
      }
    }
  );
});

// - - - - - -  group management
// add new recommended venue to group
router.post("/recommend_venue", function(req, res) {
  venue_id = req.body.venue_id;
  latlng = req.body.latlng;
  user_id = req.body.user_id;
  username = req.body.username;
  phone = req.body.phone;
  venue_name = req.body.venue_name;
  attend_date = req.body.attend_date;
  group_id = req.body.group_id;
  Group.findById(group_id, function(err, group) {
    if (err) {
      return res.json({ success: false, error: constants.errors.server_error });
    } else {
      if (!group) {
        return res.json({
          success: false,
          error: constants.errors.group_error.group_not_found
        });
      } else {
        var candidate = group.venue_candidates.filter(function(item) {
          return item.venue_id == venue_id;
        });

        mixpanel.people.increment(phone, "recommend_venues");
        // if (candidate.length > 0) {
        //   return res.json({success:false, error: constants.errors.group_error.duplicated_venue})
        // } else
        {
          let new_candidate = {
            venue_id: venue_id,
            venue_name: venue_name,
            latlng: latlng,
            date: attend_date,
            thumbup: [],
            thumbdown: [],
            recommender: user_id
          };
          group.venue_candidates.push(new_candidate);
          group.save(err => {
            if (err) {
              return res.json({
                success: false,
                error: constants.errors.server_error
              });
            } else {
              getNotificationTokens(group_id).then(tokens => {
                const registrationIds = tokens;
                const payload = {
                  callbacknumber: phone,
                  notification_type: "recommend_venue"
                };
                var message = `${username} wants to know if you are interested in going to ${venue_name}!`;
                push.sendNotification(registrationIds, message, payload);
              });
              return res.json({ success: true, data: { newgroup: group } });
            }
          });
        }
      }
    }
  });
});
router.post("/create_group", function(req, res) {
  let group_name = req.body.group_name;
  if (group_name.length < 4) {
    return res.json({
      success: false,
      error: constants.errors.group_name_length_short
    });
  }
  let memberaddable = req.body.memberaddable;
  let creator_id = req.body.creator_id;
  let phone = req.body.phone;
  Group.findOne({ group_name: group_name }, function(err, doc) {
    if (err) {
      return res.json({ success: false, error: constants.errors.server_error });
    } else {
      mixpanel.people.increment(phone, "created_groups");
      newgroup = new Group();
      newgroup.group_name = group_name;
      newgroup.creator = creator_id;
      newgroup.memberaddable = memberaddable;
      newgroup.members = [creator_id];
      newgroup.venue_candidates = [];
      newgroup.save(err => {
        if (err) {
          return res.json({
            success: false,
            error: constants.errors.server_error
          });
        } else {
          let newgrouprequest = new GroupRequest();
          newgrouprequest.user_id = creator_id;
          newgrouprequest.phone = phone;
          newgrouprequest.group = newgroup._id;
          newgrouprequest.user_role = constants.roleingroup.creator;
          newgrouprequest.status = constants.groupjoinrequeststatus.accepted;
          newgrouprequest.save(err => {
            if (err) {
              return res.json({
                success: false,
                error: constants.errors.server_error
              });
            } else {
              return res.json({ success: true, data: { newgroup: newgroup } });
            }
          });
        }
      });
    }
  });
});

// get groups created by user
router.post("/get_groups", function(req, res) {
  creator_phone = req.body.creator_phone;
  GroupRequest.find({
    $and: [
      { phone: creator_phone },
      { status: { $not: { $eq: constants.groupjoinrequeststatus.rejected } } }
    ]
  })
    .populate({
      path: "group",
      select: "-__v",
      populate: [
        { path: "members", select: "username photo" },
        { path: "venue_candidates.recommender", select: "username photo" }
      ]
    })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
        return res.json({
          success: false,
          error: constants.errors.server_error
        });
      } else {
        let tempdoc = JSON.parse(JSON.stringify(doc));
        if (tempdoc) {
          tempdoc.forEach(function(element) {
            element.group.members.forEach(function(member) {
              let host = `${req.protocol}://${req.headers.host}`;
              member.photo = member.photo
                ? member.photo
                : `${host}/images/default_user.png`;
            });
          });
        } else {
          tempdoc = [];
        }
        return res.json({ success: true, data: { groups: tempdoc } });
      }
    });
});
// get group info
router.post("/get_groupinfo", function(req, res) {
  let group_id = req.body.group_id;
  Group.findById(group_id)
    .populate("members", "-password -recover_password -__v")
    .exec(function(err, doc) {
      if (err) {
        return res.json({
          success: false,
          error: constants.errors.server_error
        });
      } else {
        return res.json({ success: true, data: { group: doc } });
      }
    });
});
// thumbup or down and add comment to candidate venue
router.post("/comment_candidate", function(req, res) {
  username = req.body.username;
  user_id = req.body.user_id;

  phone = req.body.phone;
  group_id = req.body.group_id;
  candidate_id = req.body.candidate_id;
  isthumbup = req.body.isthumbup;
  photo = req.body.photo;
  comment = req.body.comment;
  mixpanel.people.increment(phone, "commented_candidates");
  Group.findById(group_id, function(err, doc) {
    if (err) {
      return res.json({ success: false, error: constants.errors.server_error });
    } else {
      if (doc) {
        for (let i = 0; i < doc.venue_candidates.length; i++) {
          if (doc.venue_candidates[i]._id == candidate_id) {
            let existthumbup = doc.venue_candidates[i].thumbup.filter(function(
              item
            ) {
              return item.user_id == user_id;
            });
            let existthumbdown = doc.venue_candidates[i].thumbdown.filter(
              function(item) {
                return item.user_id == user_id;
              }
            );
            if (existthumbup.length > 0 || existthumbdown.length > 0) {
              return res.json({
                success: false,
                error: constants.errors.group_error.duplicated_comment
              });
            } else {
              if (isthumbup) {
                let newthumbup = {
                  user_id: user_id,
                  username: username,
                  photo: photo,
                  comment: comment
                };
                doc.venue_candidates[i].thumbup.push(newthumbup);
              } else {
                let newthumbdown = {
                  user_id: user_id,
                  username: username,
                  photo: photo,
                  comment: comment
                };
                doc.venue_candidates[i].thumbdown.push(newthumbdown);
              }
              doc.venue_candidates[i].lastThumbUserPhoto = photo;
              var venue_candidate_date = doc.venue_candidates[i].date;
              var venue_name = doc.venue_candidates[i].venue_name;
              doc.save(err => {
                if (err) {
                  return res.json({
                    success: false,
                    error: constants.errors.server_error
                  });
                } else {
                  getNotificationTokens(group_id).then(tokens => {
                    const registrationIds = tokens;
                    const payload = {
                      callbacknumber: phone,
                      notification_type: "comment_candidate"
                    };
                    let interested = isthumbup
                      ? "interested"
                      : "not interested";

                    var message = `${username} is ${interested} in going to ${venue_name} on ${venue_candidate_date}!`;
                    push.sendNotification(registrationIds, message, payload);
                  });
                  return res.json({ success: true, data: { newgroup: doc } });
                }
              });
            }

            break;
          }
        }
        //return res.json({success:false, error: constants.errors.group_error.venue_not_found})
      } else {
        return res.json({
          success: false,
          error: constants.errors.group_error.duplicated_group
        });
      }
    }
  });
});
router.post("/leave_group", function(req, res) {
  let username = req.body.username;
  let user_id = req.body.user_id;
  let phone = req.body.phone;
  let group_id = req.body.group_id;
  mixpanel.people.increment(phone, "leaved_groups");
  getNotificationTokens(group_id).then(tokens => {
    const registrationIds = tokens;
    const payload = {
      callbacknumber: phone,
      notification_type: "leave_group"
    };
    var message = `${username} has left the group!`;
    push.sendNotification(registrationIds, message, payload);
    GroupRequest.remove(
      { $and: [{ group: group_id }, { user_id: user_id }] },
      function(err, result) {
        if (err) {
          return res.json({
            success: false,
            error: constants.errors.server_error
          });
        } else {
          return res.json({ success: true, data: {} });
        }
      }
    );
    Group.findById(group_id, function(err, group) {
      if (group) {
        let members = group.members;

        if (members) {
          members.splice(members.indexOf(user_id));
        }
        group.save();
      }
    });
  });
});
router.post("/join_group_request", function(req, res) {
  let callbacknumber = req.body.phone;
  let username = req.body.username;
  let group_id = req.body.group_id;
  let phonenumbers = req.body.phone_numbers;

  let applink = constants.applink;
  let androidlink = constants.androidlink;
  for (let i = 0; i < phonenumbers.length; i++) {
    mixpanel.people.increment(callbacknumber, "inviteSents");
    let phone = phonenumbers[i];
    GroupRequest.find(
      { $and: [{ group: group_id }, { phone: phone }] },
      function(err, grouprequest) {
        if (err) {
          console.log("server error!");
          return;
        }
        if (grouprequest.length == 0) {
          let newgrouprequest = new GroupRequest();
          newgrouprequest.user_id = null;
          newgrouprequest.phone = phone;
          newgrouprequest.group = group_id;
          newgrouprequest.user_role = constants.roleingroup.member;
          newgrouprequest.status = constants.groupjoinrequeststatus.pending;

          newgrouprequest.save();
        }
        User.find({ phone: phone }, function(err, existinguser) {
          if (err) {
            console.log("server error!");
            return;
          }
          if (existinguser.length == 0) {
            // send sms
            console.log("sending sms to phone number:", phone);
            let messagebody = `${username} would like you to join their group on Tribi! Download here ${applink} ${androidlink}`;
            twilioclient.messages
              .create({
                body: messagebody,
                to: phone, // Text this number
                from: constants.twilio.twilioNumber // From a valid Twilio number
              })
              .then(message => {
                console.log(message);
              })
              .catch(err => {
                console.log(err);
              });
          } else {
            // send push notification
            console.log("sending push notification phone number:", phone);
            let receiver = existinguser[0];
            const registrationIds = receiver.pushnotification_token;
            const payload = {
              callbacknumber: callbacknumber,
              notification_type: "join_group_request",
              username: username,
              group_id: group_id
            };
            var message = `${username} would like you to join their group on Tribi!`;
            push.sendNotification(registrationIds, message, payload);
          }
        });
      }
    );
  }

  return res.json({ success: true, error: constants.errors.invalid_phone });
});
router.post("/accept_group_request", function(req, res) {
  let user_id = req.body.user_id;
  let group_id = req.body.group_id;
  let phone = req.body.phone;
  // let phonenumber = req.body.phonenumber
  // let countrycode = req.body.countrycode

  // let phone = `+${countrycode}${phonenumber}`
  mixpanel.people.increment(phone, "accepted_invites");
  GroupRequest.findOne(
    { $and: [{ phone: phone }, { group: group_id }] },
    function(err, joinrequest) {
      if (err) {
        return res.json({
          success: false,
          error: constants.errors.server_error
        });
      } else {
        if (joinrequest) {
          joinrequest.user_id = user_id;
          joinrequest.status = constants.groupjoinrequeststatus.accepted;
          joinrequest.save(err => {
            if (err) {
              return res.json({
                success: false,
                error: constants.errors.server_error
              });
            } else {
              Group.findById(group_id, function(err, group) {
                if (err) {
                  return res.json({
                    success: false,
                    error: constants.errors.server_error
                  });
                } else {
                  let existmember = group.members.filter(elem => {
                    return elem == user_id;
                  });
                  if (existmember.length > 0) {
                    return res.json({ success: true, data: {} });
                  } else {
                    group.members.push(user_id);
                    group.save(err => {
                      if (err) {
                        console.log(err);
                        return res.json({
                          success: false,
                          error: constants.errors.server_error
                        });
                      } else {
                        return res.json({ success: true, data: {} });
                      }
                    });
                  }
                }
              });
            }
          });
        } else {
          return res.json({
            success: false,
            error: constants.errors.not_found
          });
        }
      }
    }
  );
});
router.post("/reject_group_request", function(req, res) {
  let user_id = req.body.user_id;
  let group_id = req.body.group_id;
  let phone = req.body.phone;
  // let phonenumber = req.body.phonenumber
  // let countrycode = req.body.countrycode

  // let phone = `+${countrycode}${phonenumber}`
  mixpanel.people.increment(phone, "rejected_invites");
  GroupRequest.findOne(
    { $and: [{ phone: phone }, { group: group_id }] },
    function(err, joinrequest) {
      if (err) {
        return res.json({
          success: false,
          error: constants.errors.server_error
        });
      } else {
        if (joinrequest) {
          joinrequest.user_id = user_id;
          joinrequest.status = constants.status.rejected;
          joinrequest.save(err => {
            if (err) {
              return res.json({
                success: false,
                error: constants.errors.server_error
              });
            } else {
              return res.json({ success: true, data: {} });
            }
          });
        } else {
          return res.json({
            success: false,
            error: constants.errors.not_found
          });
        }
      }
    }
  );
});
router.post("/setpushnotification_token", function(req, res) {
  let phone = req.body.phone;
  let token = req.body.token;
  User.find({ phone: phone }, function(err, existinguser) {
    if (err) {
      console.log("server error!");
      return;
    }
    if (existinguser.length == 0) {
      return res.json({
        success: false,
        error: constants.errors.user.user_not_found
      });
    } else {
      let newuser = existinguser[0];
      newuser.pushnotification_token = token;
      newuser.save(function(err) {
        if (err) {
          return res.json({
            success: false,
            error: constants.errors.server_error
          });
        } else {
          return res.json({
            success: true,
            data: {
              newuser: newuser
            }
          });
        }
      });
    }
  });
});
router.get("/twiliotest", function(req, res) {
  twilioclient.messages
    .create({
      body: "hello",
      to: "+8615174176503", // Text this number
      from: constants.twilio.twilioNumber // From a valid Twilio number
    })
    .then(message => {
      return res.json({ success: true, data: {} });
    })
    .catch(err => {
      console.log(err);
      return res.json({ success: false, error: constants.errors.server_error });
    });
});
router.get("/pushtest", function(req, res) {
  const registrationIds =
    "1ea46499668742c46c0862063bf691884b9e46d473beff28a4f4365c559ea9cb";
  const payload = {
    callbacknumber: "+815058097297",
    notification_type: "pushtest"
  };
  var message = "Good morning!";
  push.sendNotification(registrationIds, message, payload);
  return res.json();
});
router.post("/getAllMembers", function(req, res) {
  User.find({}, function(err, users) {
    if (err) {
      return res.json({ success: false, error: constants.errors.server_error });
    } else {
      var phones = [];

      users.forEach(function(user) {
        phones.push(user.phone);
      });

      return res.json({ success: true, phones: phones });
    }
  });
});
router.get("/test", function(req, res) {
  let group_id = "5b2c1cf16ae065e69b2b9d23";
  getNotificationTokens(group_id).then(tokens => {
    return res.json({ success: true, tokens: tokens });
  });
});
getNotificationTokens = group_id => {
  return new Promise((resolve, reject) => {
    GroupRequest.find({ group: group_id })
      .populate("user_id")
      .exec(function(err, users) {
        let tokens = [];
        if (err || !users) {
          resolve(tokens);
        } else {
          console.log(users);
          tokens = users.map(el => {
            if (el.user_id) {
              return el.user_id.pushnotification_token;
            }
          });
          console.log(tokens);
          resolve(tokens);
        }
      });
  });
};
module.exports = router;
