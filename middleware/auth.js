const crypto = require("../helpers/crypto");
const jwt = require("../helpers/jwt");
const sendAlerts = require("../helpers/telegramBot");

module.exports = async (req, res, next) => {
  const tokenEncrypted = req.header("x-auth-token");
  if (!tokenEncrypted) {
    return res.status(401).send("Access Denied. No Token Provided");
  }
  try {
    const token = crypto.decryptobj(tokenEncrypted);
    const decoded = jwt.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    sendAlerts(error);
  }
};
