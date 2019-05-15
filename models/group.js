var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var GroupSchema = new mongoose.Schema(
  {
    group_name: String,
    memberaddable: Boolean,
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    creator: Schema.Types.ObjectId,
    venue_candidates: [
      {
        venue_id: String,
        latlng: {
          latitude: String,
          longitude: String
        },
        venue_name: String,
        date: String,
        thumbup: [
          {
            user_id: String,
            username: String,
            photo: String,
            comment: String
          }
        ],
        thumbdown: [
          {
            user_id: String,
            username: String,
            photo: String,
            comment: String
          }
        ],
        lastThumbUserPhoto: String,
        recommender: { type: Schema.Types.ObjectId, ref: "User" }
      }
    ]
  },
  {
    usePushEach: true
  }
);

var Group = mongoose.model("Group", GroupSchema);
module.exports = Group;
