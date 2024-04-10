const express = require("express");
const router = express.Router();
const mongoFunctions = require("../helpers/mongoFunctions");
// const redisFunctions = require("../helpers/redisFunctions");
const sendAlerts = require("../helpers/telegramBot");
const crypto = require("../helpers/crypto");
const jwt = require("../helpers/jwt");
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const { randomId } = require("../helpers/genreateID");
const validator = require("../helpers/validations");

router.post(
  "/all",
  auth,
  asyncHandler(async (req, res) => {
    const users = await mongoFunctions.find("User");
    if (!users) {
      return res.status(400).send({ error: "Cannot find users" });
    }
    return res.status(200).send(crypto.encryptobj(users));
  })
);
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    let { error: encError } = validator.validatePayload(req.body);
    if (encError) {
      return res.status(400).send(encError.details[0].message);
    }
    const requestBody = crypto.decryptobj(req.body.enc);
    if (requestBody === "tberror") {
      return res.status(400).send("Invalid Request");
    }
    const { error } = validator.validateUser(requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    let otp;
    const existingUser = await mongoFunctions.findOne(
      "User",
      { phone: requestBody.phone },
      {}
    );
    if (existingUser) {
      // otp = Math.floor(100000 + Math.random() * 900000);
      otp = "123456";
      // redisFunctions.set(existingUser.phone, otp, "EX", 300);
      sendAlerts("Phone " + existingUser.phone + " Otp " + otp);
      return res.status(200).send(crypto.encryptobj(existingUser));
    }
    if (!existingUser) {
      requestBody.userId = randomId("UR");
      const newUser = await mongoFunctions.create("User", requestBody);
      // otp = Math.floor(100000 + Math.random() * 900000);
      otp = "123456";
      // redisFunctions.set(newUser.phone, otp, "EX", 300);
      sendAlerts("Phone " + newUser.phone + " Otp " + otp);
      return res.status(200).send(crypto.encryptobj(newUser));
    }
  })
);
router.post(
  "/verify",
  asyncHandler(async (req, res) => {
    let { error: encError } = validator.validatePayload(req.body);
    if (encError) {
      return res.status(400).send(encError.details[0].message);
    }
    const requestBody = crypto.decryptobj(req.body.enc);
    if (requestBody === "tberror") {
      return res.status(400).send("Invalid Request");
    }
    const { error } = validator.validateOtp(requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const user = await mongoFunctions.findOne(
      "User",
      { phone: requestBody.phone },
      {}
    );
    if (!user) {
      return res.status(400).send("Invalid User.");
    }
    const token = jwt.sign({ userId: user.userId, phone: user.phone });
    const encrptedToken = crypto.encryptobj(token);
    const enteredOTP = requestBody.otp;
    if (!enteredOTP) {
      return res.status(400).send("OTP is Invalid");
    }
    const storedOTP = "123456";

    if (!storedOTP) {
      return res.status(400).send("OTP Expired. Please Try again");
    }
    // const storedOTP = (await redisFunctions.get(requestBody.phone)).toString();
    console.log(
      "requestBody.phone ---->",
      requestBody.phone,
      "enteredOTP -->",
      enteredOTP,
      typeof enteredOTP,
      "storedOTP -->",
      storedOTP,
      typeof storedOTP
    );
    if (!storedOTP) {
      return res.status(400).send({ error: "OTP not found or expired" });
    }
    if (enteredOTP !== storedOTP) {
      return res.status(400).send({ error: "Incorrect OTP. please Try Again" });
    }
    if (enteredOTP === storedOTP) {
      return (
        res
          .status(200)
          //   send({
          //   message: "OTP verified successfully",
          //   token: encrptedToken,
          // });
          .send(
            crypto.encryptobj({
              message: "OTP verified successfully",
              token: encrptedToken,
            })
          )
      );
    }
  })
);

router.post(
  "/search",
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
    console.log("requestBody =====>>>", requestBody);
    const { error } = validator.validateSearch(requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const decoded = req.user;
    const userId = decoded.userId;
    const searchString = requestBody.phone;
    if (searchString.trim() === "") {
      return res.status(200).send(crypto.encryptobj([]));
    }
    // Construct a query to find users whose phone numbers contain the searchString
    const query = { phone: { $regex: searchString, $options: "i" } };
    // Search for users in the database based on the query
    const users = await mongoFunctions.find("User", query);
    if (users.length === 0) {
      return res.status(200).send(crypto.encryptobj([]));
    }
    const filteredUsers = users.filter((user) => user.userId !== userId);
    console.log("filteredUsers  ---------->", filteredUsers);
    return res.status(200).send(crypto.encryptobj(filteredUsers));
  })
);

//---------------------------------------------------------------------------
//                         Friend Functions
router.post(
  "/add-friend",
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
    const { error } = validator.validateFriend(requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const decoded = req.user;
    const userId = decoded.userId;
    const { friendId } = requestBody;
    if (userId === friendId) {
      return res.status(400).send({ error: "Cannot add yourself as a friend" });
    }
    const friend = await mongoFunctions.findOne(
      "User",
      { userId: friendId },
      {}
    );
    if (!friend) {
      console.log("friend  not found");
      return res.status(404).send({ error: "User not found" });
    }
    const user = await mongoFunctions.findOne("User", { userId: userId }, {});
    if (!user) {
      console.log("user not found");
      return res.status(404).send({ error: "User not found" });
    }
    if (user.sentRequests.some((request) => request.userId === friendId)) {
      return res.status(400).send({ error: "Request is already been sent" });
    }
    if (user.friends.some((friend) => friend.friendId === friendId)) {
      return res.status(400).send({ error: "Already a friend" });
    }

    if (friend.friendRequests.some((request) => request.userId === userId)) {
      return res.status(400).send({ error: "Friend request already exists" });
    }

    // Add friendId to user's sentRequests if it doesn't already exist
    const sentRequestExists = user.sentRequests.some(
      (request) => request.userId === friendId
    );
    if (sentRequestExists) {
      return res
        .status(400)
        .send({ error: "Already a friend request is sent" });
    }
    if (!sentRequestExists) {
      user.sentRequests.push({ userId: friendId, phone: friend.phone });
    }

    // Add userId to friend's friendRequests if it doesn't already exist
    const friendRequestExists = friend.friendRequests.some(
      (request) => request.userId === userId
    );
    if (friendRequestExists) {
      return res
        .status(400)
        .send({ error: "Already a friend request is sent" });
    }
    if (!friendRequestExists) {
      friend.friendRequests.push({ userId: userId, phone: user.phone });
    }

    // Save changes to both user and friend
    await Promise.all([user.save(), friend.save()]);

    return res
      .status(200)
      .send(crypto.encryptobj({ message: "Friend request sent successfully" }));
  })
);
router.post(
  "/accept-friend",
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
    console.log("requestBody =====>>>", requestBody);
    const { error } = validator.validateFriend(requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const decoded = req.user;
    const userId = decoded.userId;
    const { friendId } = requestBody;
    console.log("userId --->", userId, "friendId--->", friendId);

    const user = await mongoFunctions.findOne("User", { userId: userId }, {});

    const friend = await mongoFunctions.findOne(
      "User",
      { userId: friendId },
      {}
    );

    if (!user) {
      console.log("User not found");
      return res.status(404).send({ error: "User not found" });
    }
    if (!friend) {
      return res.status(404).send({ error: "Friend not found" });
    }

    const friendRequestIndex = user.friendRequests.findIndex(
      (request) => request.userId === friendId
    );

    if (friendRequestIndex === -1) {
      return res.status(404).send({ error: "Friend request not found" });
    }

    user.friends.push({ friendId, status: "accepted", phone: friend.phone });
    user.friendRequests.splice(friendRequestIndex, 1);

    friend.friends.push({ friendId: userId, status: "accepted" });

    const sentRequestIndex = friend.sentRequests.findIndex(
      (request) => request.userId === userId
    );
    if (sentRequestIndex === -1) {
      return res.status(404).send({ error: "sent request not found" });
    }
    console.log(sentRequestIndex);
    friend.sentRequests.splice(sentRequestIndex, 1);

    await Promise.all([
      mongoFunctions.updateOne("User", { userId: userId }, user),
      mongoFunctions.updateOne("User", { userId: friendId }, friend),
    ]);

    return res
      .status(200)
      .send(crypto.encryptobj({ message: "Friend request accepted" }));
    // .send({ message: "Friend request accepted" });
  })
);

router.post(
  "/reject-friend",
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
    console.log("requestBody =====>>>", requestBody);
    const { error } = validator.validateFriend(requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const decoded = req.user;
    const userId = decoded.userId;
    const { friendId } = requestBody;
    const user = await mongoFunctions.findOne("User", { userId: userId });
    const friend = await mongoFunctions.findOne("User", { userId: friendId });
    if (!user) {
      console.log("user not found");
      return res.status(404).send({ error: "User not found" });
    }
    if (!friend) {
      console.log("friend not found");
      return res.status(404).send({ error: "User not found" });
    }

    user.friendRequests = user.friendRequests.filter(
      (request) => request.userId !== friendId
    );

    const sentRequestIndex = friend.sentRequests.findIndex(
      (request) => request.userId === userId
    );
    if (sentRequestIndex === -1) {
      return res.status(404).send({ error: "sent request not found" });
    }

    friend.sentRequests.splice(sentRequestIndex, 1);

    await mongoFunctions.updateOne("User", { userId: userId }, user);
    await mongoFunctions.updateOne("User", { userId: friendId }, friend),
      console.log(sentRequestIndex);
    console.log("Completed");

    return res
      .status(200)
      .send(crypto.encryptobj({ message: "Friend request rejected" }));
    // .send({ message: "Friend request rejected" });
  })
);

router.post(
  "/friends",
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
    console.log("requestBody =====>>>", requestBody);
    const { error } = validator.validateUser(requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const decoded = req.user;
    const userId = decoded.userId;
    const user = await mongoFunctions.findOne("User", { userId: userId });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    const friends = user.friends.filter(
      (friend) => friend.status === "accepted"
    );
    // return res.send(friends);
    return res.status(200).send(crypto.encryptobj(friends));
  })
);
router.post(
  "/friend-requests",
  auth,
  asyncHandler(async (req, res) => {
    let { error: encError } = validator.validatePayload(req.body);
    if (encError) {
      return res.status(400).send(encError.details[0].message);
    }
    console.log("requestBody =====>>>", requestBody);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const decoded = req.user;
    const userId = decoded.userId;
    const user = await mongoFunctions.findOne("User", { userId: userId });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    const friendRequests = user.friendRequests;
    console.log(friendRequests);
    return res.status(200).send(crypto.encryptobj(friendRequests));
  })
);

module.exports = router;
