const express = require("express");
const router = express.Router();
const mongoFunctions = require("../helpers/mongoFunctions");
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const { randomId } = require("../helpers/genreateID");

// Get all groups
router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const groups = await mongoFunctions.find("Group");
    res.status(200).json(groups);
  })
);

// Create a group
router.post(
  "/create",
  asyncHandler(async (req, res) => {
    console.log("req.body ---->", req.body);
    const existingGrp = await mongoFunctions.findOne(
      "Group",
      { name: req.body.name },
      {}
    );
    if (existingGrp) {
      // console.log("group already exists!");
      res.send({ message: "group already exists" });
    } else {
      let group;
      req.body.groupId = randomId("GP");
      group = await mongoFunctions.create("Group", req.body);
      res.status(200).json(group);
    }
  })
);

// Add multiple members to a group
router.post(
  "/addMembers",
  // auth,
  asyncHandler(async (req, res) => {
    console.log("req.body ------->", req.body);
    const { groupId, users } = req.body;
    console.log("from request", groupId, users);

    // Array to hold users not found in the database
    const usersNotFound = [];

    // Loop through each user to check if they exist in the database
    for (const user of users) {
      const userExists = await mongoFunctions.findOne(
        "User",
        { userId: user.userId },
        {}
      );
      if (!userExists) {
        // If user is not found, push user's id to usersNotFound array
        // console.log(user.userId);
        usersNotFound.push(user.userId);
      }
    }

    // If there are users not found, send error response
    if (usersNotFound.length > 0) {
      return res
        .status(404)
        .json({ error: "Some users are not available", usersNotFound });
    }

    // All users are found, proceed to add them to the group
    const group = await mongoFunctions.findOne(
      "Group",
      { groupId: req.body.groupId },
      {}
    );

    if (!group) return res.status(404).send("Group not found");

    // group.users.push(users.map((user) => user.userId));
    group.users = users;

    await group.save();
    res.status(200).json(group);
  })
);

// router.post(
//   "/addMembers",
//   // auth,
//   asyncHandler(async (req, res) => {
//     console.log("req.body ------->", req.body);
//     const { groupId, users } = req.body;
//     console.log("from request", groupId, users);
//     const group = await mongoFunctions.findOne(
//       "Group",
//       { groupId: req.body.groupId },
//       {}
//     );
//     console.log(group);

//     if (!group) return res.status(404).send("Group not found");

//     group.users.push(...users);

//     await group.save();
//     res.status(200).json(group);
//   })
// );

module.exports = router;
