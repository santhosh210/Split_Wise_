const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const mongoFunctions = require("../helpers/mongoFunctions");
const { Group } = require("../models/Group");
const { randomId } = require("../helpers/genreateID");
const auth = require("../middleware/auth");
// Get all expenses
router.post(
  "/all",
  asyncHandler(async (req, res) => {
    // const expenses = await Expense.find();
    const expenses = await mongoFunctions.find("Expense");
    res.status(200).json(expenses);
  })
);

// Create an expense
router.post(
  "/create",
  asyncHandler(async (req, res) => {
    const {
      description,
      amount,
      date,
      payer,
      participants,
      splitType,
      splitDetails,
    } = req.body;
    const expenseId = randomId("EX");

    // Validate expense data
    // const { error } = validateExpense(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    // Check if the payer exists
    // const payerUser = await User.findById(payer);
    const payerUser = await mongoFunctions.findOne(
      "User",
      { userId: payer },
      {}
    );
    console.log(payerUser);
    if (!payerUser) return res.status(400).send("Payer user not found");

    // Check if participants exist
    for (const participant of participants) {
      console.log("participant ----->", participant);
      // const participantUser = await User.findById(participant.user);
      const participantUser = await mongoFunctions.findOne(
        "User",
        { userId: participant.user },
        {}
      );
      console.log("participantUser", participantUser);
      if (!participantUser)
        return res
          .status(400)
          .send(`Participant user ${participant.user} not found`);
    }

    // Create the expense
    const expense = new Expense({
      expenseId,
      description,
      amount,
      date,
      payer,
      participants,
      splitType,
      splitDetails,
    });

    await expense.save();
    res.status(201).json(expense);
  })
);

// Get expenses by user ID
router.post(
  "/user/expenses",
  auth,
  asyncHandler(async (req, res) => {
    const decoded = req.user;
    const userId = decoded.userId;
    // const expenses = await Expense.find({ "participants.user": userId });
    const expenses = await mongoFunctions.findOne(
      "Expense",
      { expenseId: req.body.expenseId },
      {}
    );

    res.status(200).json(expenses);
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
    res.status(200).json(expenses);
  })
);

// Get expense by ID
// router.post(
//   "/expense",
//   asyncHandler(async (req, res) => {
//     const expenseId = req.body.expenseId;
//     const expense = await Expense.findById(expenseId);
//     if (!expense) return res.status(404).send("Expense not found");
//     res.status(200).json(expense);
//   })
// );

// Update expense by ID
// router.put(
//   "/expense/update",
//   asyncHandler(async (req, res) => {
//     const {
//       expenseId,
//       description,
//       amount,
//       date,
//       payer,
//       participants,
//       splitType,
//       splitDetails,
//     } = req.body;

// Validate expense data
//     const { error } = validateExpense(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     const expense = await Expense.findByIdAndUpdate(
//       expenseId,
//       {
//         description,
//         amount,
//         date,
//         payer,
//         participants,
//         splitType,
//         splitDetails,
//       },
//       { new: true }
//     );

//     if (!expense) return res.status(404).send("Expense not found");

//     res.status(200).json(expense);
//   })
// );

// Delete expense by ID
// router.post(
//   "/expense/delete",
//   asyncHandler(async (req, res) => {
//     const expenseId = req.body.expenseId;
//     const expense = await Expense.findByIdAndRemove(expenseId);
//     if (!expense) return res.status(404).send("Expense not found");

//     res.status(200).json({ message: "Expense deleted successfully" });
//   })
// );

module.exports = router;
