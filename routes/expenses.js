const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const mongoFunctions = require("../helpers/mongoFunctions");
const { randomId } = require("../helpers/genreateID");
const auth = require("../middleware/auth");
const validator = require("../helpers/validations");
const crypto = require("../helpers/crypto");
router.post(
  "/all",
  auth,
  asyncHandler(async (req, res) => {
    const expenses = await mongoFunctions.find("Expense");
    if (!expenses) {
      return res.status(400).send({ error: "Cannot find expenses" });
    }
    return res.status(200).send(crypto.decryptobj(expenses));
  })
);

router.post(
  "/create",
  auth,
  asyncHandler(async (req, res) => {
    let { error: encError } = validator.validatePayload(req.body);
    if (encError) {
      return res.status(400).send(encError.details[0].message);
    }
    const requestBody = crypto.decryptobj(req.body.enc);
    if (requestBody === "tberror") {
      return res.status(400).send("Invalid Request");
    }
    requestBody.expenseId = randomId("UR");
    // console.log("requestBody =====>>>", requestBody);
    const { error } = validator.validateExpense(requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    // Extract data from the request body
    const { description, amount, payer, participants, splitType } = requestBody;

    // console.log("requestBody =====>>>", requestBody);
    // Create a new expense instance
    // const newExpense = await mongoFunctions.create("Expense", requestBody);

    // Adjust expense data based on split type
    const payerContribution = payer.payerAmount;
    const participantContribution = participants[0].participantAmount;

    switch (splitType) {
      case "equally":
        if (participants.length === 1) {
        } else {
        }

        break;
      case "percentages":
        let totalPayerPercentage;
        let totalParticipantPercentage;
        totalPayerPercentage = payer.payerPercentage;
        if (participants.length === 0) {
          return res.status(400).send({ error: "Add participants." });
        }
        if (participants.length === 1) {
          totalParticipantPercentage = participants[0].participantPercentage;
        } else {
          totalParticipantPercentage = participants.reduce(
            (acc, participant) => acc + participant.participantPercentage,
            0
          );
        }
        if (totalPayerPercentage + totalParticipantPercentage !== 100) {
          return res
            .status(400)
            .send({ error: "Total participant percentage must equal 100." });
        }
        const payerAmount = (amount * totalPayerPercentage) / 100;
        const participantTotalAmount = amount - payerAmount;

        // Assign payer's amount and update paid field
        payer.payerAmount = payerAmount;
        payer.paid = payerAmount;

        if (participants.length === 1) {
          // If there's only one participant
          const participant = participants[0];
          participant.participantAmount = participantTotalAmount;
          participant.owes = participantTotalAmount;
          participant.paid = 0;
        } else {
          // If there are multiple participants
          participants.forEach((participant) => {
            participant.participantAmount =
              (participant.participantPercentage * participantTotalAmount) /
              100;
            participant.owes = participant.participantAmount;
            participant.paid = 0;
          });
        }

        break;

      case "shares":
        // Assign amount, owes, and paid based on share for payer and participants
        const payerShares = payer.payerShare;
        let participantShares = participants[0].participantShare;
        const totalShares = payerShares + participantShares;
        const eachShareAmount = amount / totalShares;
        const payeShareAmount = eachShareAmount * payerShares;
        payer.payerAmount = payeShareAmount;
        payer.paid = payeShareAmount;

        participants[0].participantAmount = eachShareAmount * participantShares;
        participants[0].owes = participants[0].participantAmount;
        console.log(totalShares);
        //  const participantAmountShare =
        //   (amount - payerShares) / participants.length;
        // participants.forEach((participant) => {
        //   participant.participantAmount = participantAmountShare;
        //   participant.owes = participantAmountShare;
        //   participant.paid = 0;
        // });
        // payer.payerAmount = payerShares;
        // payer.owes = 0;
        // payer.paid = 0;
        break;
      // Handle other split types as needed
      case "unequally":
        // const payerContribution = payer.payerAmount;
        // const participantContribution = participants[0].participantAmount;
        if (payerContribution + participantContribution === amount) {
          payer.paid = payerContribution;
          participants[0].owes = participantContribution;
        } else if (payerContribution + participantContribution > amount) {
          return res.status(400).send({
            message: `The per person amounts don't add up the total amount ${amount}.You are over by ${
              payerContribution + participantContribution - amount
            }`,
          });
        } else {
          return res
            .status(400)
            .send(
              `The per person amounts don't add up the total amount ${amount}.You are under by ${
                amount - (payerContribution + participantContribution)
              } `
            );
        }
        break;
    }

    // Save the expense to the database
    const newExpense = await mongoFunctions.create("Expense", requestBody);
    // Respond with the saved expense data
    res.status(200).send(crypto.encryptobj(newExpense));
  })
);

// Get expenses by user ID
router.post(
  "/user/expenses",
  auth,
  asyncHandler(async (req, res) => {
    const decoded = req.user;
    const userId = decoded.userId;
    const expenses = await mongoFunctions.findOne(
      "Expense",
      { expenseId: req.body.expenseId },
      {}
    );

    return res.status(200).send(expenses);
  })
);

// Get expenses by group ID
router.post(
  "/group/expenses",
  auth,
  asyncHandler(async (req, res) => {
    const groupId = req.body.groupId;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).send("Group not found");

    const expenses = await Expense.find({
      "participants.user": { $in: group.users.map((user) => user.userId) },
    });
    return res.status(200).send(expenses);
  })
);

module.exports = router;
