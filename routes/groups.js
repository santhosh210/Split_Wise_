const express = require("express");
const router = express.Router();
const mongoFunctions = require("../helpers/mongoFunctions");
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const { randomId } = require("../helpers/genreateID");
const validator = require("../helpers/validations");
const crypto = require("../helpers/crypto");

// Get all groups
router.post(
  "/all",
  asyncHandler(async (req, res) => {
    const groups = await mongoFunctions.find("Group");
    if (!groups) {
      return res.status(400).send({ error: "Cannot find groups" });
    }
    return res.status(200).send(crypto.encryptobj(groups));
  })
);

router.post(
  "/createAndAddMembers",
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

    const { name, users } = requestBody;

    // Validate group data
    const { error } = validator.validateGroup(requestBody);
    if (error) {
      console.log("validation error");
      return res.status(400).send(error.details[0].message);
    }

    // ckeck members
    const usersNotFound = [];
    for (const user of users) {
      const userExists = await mongoFunctions.findOne(
        "User",
        { userId: user.userId },
        {}
      );
      if (!userExists) {
        usersNotFound.push(user.userId);
      }
    }
    if (usersNotFound.length > 0) {
      console.log("users not found");
      return res
        .status(404)
        .json({ error: "Some users are not available", usersNotFound });
    }
    // Create group
    const groupId = randomId("GP");
    const group = await mongoFunctions.create("Group", {
      name,
      groupId,
      users,
    });

    return res.status(200).send(crypto.encryptobj(group));
  })
);

module.exports = router;
