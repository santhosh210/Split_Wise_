const sendAlerts = require("../helpers/telegramBot");
module.exports = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (ex) {
      const err = ex;
      sendAlerts(ex.stack);
      next(ex);
    }
  };
};
