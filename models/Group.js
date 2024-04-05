const mongoose = require("mongoose");
const Joi = require("joi");
const { userSchema } = require("./User");
const { randomId } = require("../helpers/genreateID");

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

const validateGroup = (group) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    users: Joi.array().items(
      Joi.object({
        userId: Joi.string().required(),
      })
    ),
  });
  return schema.validate(group);
};

module.exports = {
  Group,
  validateGroup,
};
