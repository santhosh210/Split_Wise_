const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /\d{10}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  sentRequests: [
    {
      userId: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
    },
  ],
  friendRequests: [
    {
      userId: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
      status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
      },
    },
  ],
  friends: [
    {
      friendId: {
        type: String,
      },
      phone: {
        type: String,
      },
      status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
      },
    },
  ],
  expenses: [
    {
      type: String,
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
