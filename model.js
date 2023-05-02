const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  user_id: {
    type: String,
  },
  username: {
    type: String,
  },
  access_token: {
    type: String,
  },
  phone_number: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
