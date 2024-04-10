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

router.post(
  "/all",
  auth,
  asyncHandler(async (req, res) => {
    const users = await mongoFunctions.find("User");
    res.status(200).send(crypto.encryptobj(users));
  })
);
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    req.body = crypto.decryptobj(req.body.enc);
    let otp;
    const existingUser = await mongoFunctions.findOne(
      "User",
      { phone: req.body.phone },
      {}
    );
    if (existingUser) {
      // otp = Math.floor(100000 + Math.random() * 900000);
      otp = "123456";
      // redisFunctions.set(existingUser.phone, otp, "EX", 300);
      sendAlerts("Phone " + existingUser.phone + " Otp " + otp);
      res.send(existingUser);
      console.log(existingUser);
      return res.send(crypto.encryptobj(existingUser));
    }
    if (!existingUser) {
      req.body.userId = randomId("UR");
      const newUser = await mongoFunctions.create("User", req.body);
      // otp = Math.floor(100000 + Math.random() * 900000);
      otp = "123456";
      // redisFunctions.set(newUser.phone, otp, "EX", 300);
      sendAlerts("Phone " + newUser.phone + " Otp " + otp);
      console.log(newUser);
      // res.status(200).json(newUser);
      res.status(200).send(crypto.encryptobj(newUser));
    }
  })
);

router.post(
  "/search",
  auth,
  asyncHandler(async (req, res) => {
    const decoded = req.user;
    const userId = decoded.userId;
    req.body = crypto.decryptobj(req.body.enc);
    console.log(req.body);
    const searchString = req.body.phone;
    console.log("searchString --->", searchString, typeof searchString);

    // Check if searchString exists and is a non-empty string
    if (
      !searchString ||
      typeof searchString !== "string" ||
      searchString.trim() === ""
    ) {
      // return res.status(200).crypto.encryptobj([]);
      return res.status(200).json({});
    }

    // Construct a query to find users whose phone numbers contain the searchString
    const query = { phone: { $regex: searchString, $options: "i" } };

    // Search for users in the database based on the query
    const users = await mongoFunctions.find("User", query);

    // If no users are found, return a custom message
    if (users.length === 0) {
      return res.status(200).send(crypto.encryptobj([]));
    }

    const filteredUsers = users.filter((user) => user.userId !== userId);
    console.log("filteredUsers  ---------->", filteredUsers);
    // Return the found users
    // res.status(200).json(filteredUsers);
    res.status(200).send(crypto.encryptobj(filteredUsers));
  })
);

router.post(
  "/verify",
  asyncHandler(async (req, res) => {
    console.log(req.body);
    req.body = crypto.decryptobj(req.body.enc);
    const user = await mongoFunctions.findOne(
      "User",
      { phone: req.body.phone },
      {}
    );
    console.log(user);
    const token = jwt.sign({ userId: user.userId, phone: user.phone });
    const encrptedToken = crypto.encryptobj(token);
    const enteredOTP = req.body.otp;
    const storedOTP = req.body.otp;
    // const storedOTP = (await redisFunctions.get(req.body.phone)).toString();
    console.log(
      "req.body.phone ---->",
      req.body.phone,
      "enteredOTP -->",
      typeof enteredOTP,
      "storedOTP -->",
      typeof storedOTP
    );
    if (!storedOTP) {
      // return res.status(400).json({ error: "OTP not found or expired" });
      return res
        .status(400)
        .send(crypto.encryptobj({ error: "OTP not found or expired" }));
    }
    if (enteredOTP !== storedOTP) {
      // return res.status(400).json({ error: "Invalid OTP" });
      return res.status(400).send(crypto.encryptobj({ error: "Invalid OTP" }));
    }
    if (enteredOTP === storedOTP) {
      return (
        res
          .status(200)
          //   .json({
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
//---------------------------------------------------------------------------
//                         Friend Functions
router.post(
  "/add-friend",
  auth,
  asyncHandler(async (req, res) => {
    req.body = crypto.decryptobj(req.body.enc);
    const decoded = req.user;
    const userId = decoded.userId;
    const { friendId } = req.body;
    // Check if trying to add yourself as a friend
    if (userId === friendId) {
      return res.status(400).json({ error: "Cannot add yourself as a friend" });
    }
    // Check if friend exists
    const friend = await mongoFunctions.findOne(
      "User",
      { userId: friendId },
      {}
    );
    if (!friend) {
      console.log("friend  not found");
      // return res.status(404).json({ error: "User not found" });
      return res.status(404).send({ error: "User not found" });
    }

    // Check if user exists
    const user = await mongoFunctions.findOne("User", { userId: userId }, {});
    if (!user) {
      console.log("user not found");
      return res.status(404).send({ error: "User not found" });
      // return res.status(404).json({ error: "User not found" });
    }

    // Check if friend request is already sent
    if (user.sentRequests.some((request) => request.userId === friendId)) {
      // console.log("Request is already been sent");
      return res.status(400).json({ error: "Request is already been sent" });
    }

    // Check if they are already friends
    if (user.friends.some((friend) => friend.friendId === friendId)) {
      console.log("Already a friend");
      return res.status(400).json({ error: "Already a friend" });
    }

    // Check if friend request already exists
    if (friend.friendRequests.some((request) => request.userId === userId)) {
      console.log("Friend request already exists");
      return res.status(400).json({ error: "Friend request already exists" });
    }

    // Add friendId to user's sentRequests if it doesn't already exist
    const sentRequestExists = user.sentRequests.some(
      (request) => request.userId === friendId
    );
    if (!sentRequestExists) {
      user.sentRequests.push({ userId: friendId, phone: friend.phone });
    }

    // Add userId to friend's friendRequests if it doesn't already exist
    const friendRequestExists = friend.friendRequests.some(
      (request) => request.userId === userId
    );
    if (!friendRequestExists) {
      friend.friendRequests.push({ userId: userId, phone: user.phone });
    }

    // Save changes to both user and friend
    await Promise.all([user.save(), friend.save()]);

    res.status(200).json({ message: "Friend request sent successfully" });
  })
);

// router.post(
//   "/add-friend",
//   auth,
//   asyncHandler(async (req, res) => {
//     req.body = crypto.decryptobj(req.body.enc);
//     const decoded = req.user;
//     const userId = decoded.userId;
//     const { friendId } = req.body;
//     // Check if trying to add yourself as a friend
//     if (userId === friendId) {
//       return res.status(400).json({ error: "Cannot add yourself as a friend" });
//     }
//     // Check if friend exists
//     const friend = await mongoFunctions.findOne(
//       "User",
//       { userId: friendId },
//       {}
//     );
//     if (!friend) {
//       console.log("friend  not found");
//       // return res.status(404).json({ error: "User not found" });
//       return res.status(404).sned({ error: "User not found" });
//     }

//     // Check if user exists
//     const user = await mongoFunctions.findOne("User", { userId: userId }, {});
//     if (!user) {
//       console.log("user not found");
//       return res.status(404).send({ error: "User not found" });
//       // return res.status(404).json({ error: "User not found" });
//     }

//     // Check if friend request is already sent
//     if (user.sentRequests.some((request) => request.userId === friendId)) {
//       // console.log("Request is already been sent");
//       return res.status(400).json({ error: "Request is already been sent" });
//     }

//     // Check if they are already friends
//     if (user.friends.some((friend) => friend.friendId === friendId)) {
//       console.log("Already a friend");
//       return res.status(400).json({ error: "Already a friend" });
//     }

//     // Check if friend request already exists
//     if (friend.friendRequests.some((request) => request.userId === userId)) {
//       console.log("Friend request already exists");
//       return res.status(400).json({ error: "Friend request already exists" });
//     }

//     // Add friendId to user's sentRequests
//     user.sentRequests.push({ userId: friendId, phone: friend.phone });

//     // Add userId to friend's friendRequests
//     friend.friendRequests.push({ userId: userId, phone: user.phone });

//     // Save changes to both user and friend
//     await Promise.all([user.save(), friend.save()]);

//     res.status(200).json({ message: "Friend request sent successfully" });
//   })
// );

router.post(
  "/accept-friend",
  auth,
  asyncHandler(async (req, res) => {
    req.body = crypto.decryptobj(req.body.enc);
    const decoded = req.user;
    const userId = decoded.userId;
    const { friendId } = req.body;
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

    const friendRequestIndex = user.friendRequests.findIndex(
      (request) => request.userId === friendId
    );

    if (friendRequestIndex === -1) {
      return res.status(404).send({ error: "Friend request not found" });
    }

    user.friends.push({ friendId, status: "accepted", phone: friend.phone });
    user.friendRequests.splice(friendRequestIndex, 1);

    if (!friend) {
      // return res.status(404).json({ error: "Friend not found" });
      return res.status(404).send({ error: "Friend not found" });
    }

    friend.friends.push({ friendId: userId, status: "accepted" });

    const sentRequestIndex = friend.sentRequests.findIndex(
      (request) => request.userId === userId
    );
    if (sentRequestIndex === -1) {
      // return res.status(404).json({ error: "sent request not found" });
      return res.status(404).json({ error: "sent request not found" });
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
    // .json({ message: "Friend request accepted" });
  })
);

router.post(
  "/reject-friend",
  auth,
  asyncHandler(async (req, res) => {
    req.body = crypto.decryptobj(req.body.enc);
    const decoded = req.user;
    const userId = decoded.userId;
    const { friendId } = req.body;
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
    // .json({ message: "Friend request rejected" });
  })
);

router.post(
  "/friends",
  auth,
  asyncHandler(async (req, res) => {
    req.body = crypto.decryptobj(req.body.enc);
    const decoded = req.user;
    const userId = decoded.userId;

    const user = await mongoFunctions.findOne("User", { userId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
    req.body = crypto.decryptobj(req.body.enc);
    const decoded = req.user;
    const userId = decoded.userId;

    const user = await mongoFunctions.findOne("User", { userId: userId });
    if (!user) {
      // return res.status(404).json({ error: "User not found" });
      return res.status(404).send({ error: "User not found" });
    }

    const friendRequests = user.friendRequests;
    console.log(friendRequests);
    // return res.status(200).send(friendRequests);
    return res.status(200).send(crypto.encryptobj(friendRequests));
  })
);

module.exports = router;
