const cryptojs = require("../helpers/crypto");
const jwt = require("../helpers/jwt");
const sendAlerts = require("../helpers/telegramBot");

module.exports = async (req, res, next) => {
  try {
    console.log("Reached Auth");
    const tokenEncrypted = req.header("x-auth-token");
    console.log(tokenEncrypted);
    if (!tokenEncrypted) {
      return res.status(401).send("Access Denied. No Token Provided");
    }
    const token = cryptojs.decryptobj(tokenEncrypted);
    const decoded = jwt.verify(token);
    console.log("decoded -----> from middleware", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    sendAlerts(error);
  }
};
