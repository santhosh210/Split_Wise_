const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./User");
const { Group } = require("./Group");

const expenseSchema = new mongoose.Schema({
  expenseId: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  payer: {
    type: String,
    ref: "User",
    required: true,
  },
  participants: [
    {
      user: {
        type: String,
        ref: "User",
        required: true,
      },
      contribution: {
        type: Number,
        required: true,
      },
    },
  ],

  splitType: {
    type: String,
    required: true,
  },
  splitDetails: {
    type: Object,
    required: true,
  },
  settled: {
    type: Boolean,
    default: false,
  },
  settledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  settlementAmount: {
    type: Number,
  },
  settlementDate: {
    type: Date,
  },
  // Additional metadata can be added here
});

const Expense = mongoose.model("Expense", expenseSchema);

const validateExpense = (expense) => {
  const schema = Joi.object({
    description: Joi.string().required(),
    // amount: Joi.number().min(0).required(),
    // date: Joi.date().iso(),
    // payer: Joi.string().required(),
    // participants: Joi.array().items(
    //   Joi.object({
    //     user: Joi.string().required(),
    //     contribution: Joi.number().min(0).required(),
    //   })
    // ),
    // splitType: Joi.string().required(),
    // splitDetails: Joi.object().required(),
    // settled: Joi.boolean(),
    // settledBy: Joi.string(),
    // settlementAmount: Joi.number().min(0),
    // settlementDate: Joi.date().iso(),
    // Additional metadata validation can be added here
  });
  return schema.validate(expense);
};

module.exports = {
  Expense,
  validateExpense,
};
