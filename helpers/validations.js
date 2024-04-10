const Joi = require("joi");
module.exports = {
  validatePayload: (data) => {
    const payloadValidationSchema = Joi.object({
      enc: Joi.string().required(),
    });
    return payloadValidationSchema.validate(data);
  },
  validateUser: function (user) {
    const userValidationSchema = Joi.object({
      userId: Joi.string(),
      phone: Joi.string()
        .trim()
        .length(10)
        .pattern(/^[6789][0-9]{9}$/)
        .required()
        .messages({ "phone.pattern": "Invalid number format" }),
      sentRequests: Joi.array().items(
        Joi.object({
          userId: Joi.string().required(),
          phone: Joi.string(),
        })
      ),
      friendRequests: Joi.array().items(
        Joi.object({
          userId: Joi.string().required(),
          phone: Joi.string(),
          status: Joi.string().valid("pending", "accepted").default("pending"),
        })
      ),
      friends: Joi.array().items(
        Joi.object({
          friendId: Joi.string(),
          phone: Joi.string(),
          status: Joi.string().valid("pending", "accepted").default("pending"),
        })
      ),
    });
    return userValidationSchema.validate(user);
  },
  validateOtp: function (otp) {
    const OtpValidationSchema = Joi.object({
      phone: Joi.string()
        .trim()
        .length(10)
        .pattern(/^[6789][0-9]{9}$/)
        .required()
        .messages({ "phone.pattern": "Invalid number format" }),
      otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    });
    return OtpValidationSchema.validate(otp);
  },
  validateFriend: function (friend) {
    const friendValidationSchema = Joi.object({
      friendId: Joi.string().required(),
    });
    return friendValidationSchema.validate(friend);
  },
  validateSearch: function (search) {
    const searchValidationSchema = Joi.object({
      phone: Joi.string().required(),
    });
    return searchValidationSchema.validate(search);
  },

  validateGroup: function (group) {
    const groupValidationSchema = Joi.object({
      name: Joi.string(),
      groupId: Joi.string(),
      users: Joi.array().items(
        Joi.object({
          userId: Joi.string().required(),
        })
      ),
    });

    return groupValidationSchema.validate(group);
  },

  validateExpense: function (expense) {
    const expenseValidationSchema = Joi.object({
      expenseId: Joi.string().required(),
      description: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      date: Joi.date().iso(),
      payer: Joi.object({
        payerId: Joi.string().required(),
        payerAmount: Joi.number().min(0),
        payerPercentage: Joi.number().min(0).max(100),
        payerShare: Joi.number().min(0),
        paid: Joi.number().min(0),
        owes: Joi.number().min(0),
      }).required(),
      participants: Joi.array()
        .items(
          Joi.object({
            participantId: Joi.string().required(),
            participantAmount: Joi.number().min(0),
            participantPercentage: Joi.number().min(0).max(100),
            participantShare: Joi.number().min(0),
            paid: Joi.number().min(0),
            owes: Joi.number().min(0),
          })
        )
        .required(),
      splitType: Joi.string()
        .valid("equally", "percentages", "shares", "unequally")
        .required(),
      settled: Joi.boolean(),
    });

    return expenseValidationSchema.validate(expense);
  },
};
