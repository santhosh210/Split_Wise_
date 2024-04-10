const mongoose = require("mongoose");

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
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  payer: {
    payerId: {
      type: String,
    },
    payerAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    payerPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    payerShare: {
      type: Number,
      default: 0,
      min: 0,
    },
    paid: {
      type: Number,
      default: 0,
      min: 0,
    },
    owes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  participants: [
    {
      participantId: {
        type: String,
        required: true,
      },
      participantAmount: {
        type: Number,
        min: 0,
      },
      participantPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      participantShare: {
        type: Number,
        default: 0,
        min: 0,
      },
      paid: {
        type: Number,
        default: 0,
        min: 0,
      },
      owes: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  ],
  splitType: {
    type: String,
    enum: ["equally", "percentages", "shares", "unequally"],
    default: "equally",
  },
  settled: {
    type: Boolean,
    default: false,
  },
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
