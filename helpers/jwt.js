const jwt = require("jsonwebtoken");
require("dotenv").config();
const privateKey = process.env.JWT_PRIVATE_KEY;
module.exports = {
  // sign: (data) => jwt.sign(data, privateKey, { expiresIn: 86400 }),
  sign: (data) => jwt.sign(data, privateKey),
  verify: (token) => jwt.verify(token, privateKey),
};
