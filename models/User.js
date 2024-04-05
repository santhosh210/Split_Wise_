const mongoose = require("mongoose");
const Joi = require("joi");

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
});

const User = mongoose.model("User", userSchema);

const userValidationSchema = Joi.object({
  phone: Joi.string(),
});

module.exports = {
  User,
  validateUser: (user) => userValidationSchema.validate(user),
};
