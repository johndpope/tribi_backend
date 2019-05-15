var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var GroupRequestSchema = new mongoose.Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  phone: String,
  user_role: String,
  status: String
});

var GroupRequest = mongoose.model("GroupRequest", GroupRequestSchema);
module.exports = GroupRequest;
