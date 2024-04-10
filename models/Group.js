const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  users: {
    type: [{ userId: { type: String } }],
    default: [],
  },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = {
  Group,
};
