const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/groups");
const expenseRouter = require("./routes/expenses");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const sendAlerts = require("./helpers/telegramBot");
require("dotenv").config();

const app = express();
const port = process.env.port;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
-app.use(helmet());
app.use(compression());
app.use("/users", userRouter);
app.use("/groups", groupRouter);
app.use("/expenses", expenseRouter);
app.get("/", (req, res) => {
  return res.send("welcome to Splitwise");
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
  sendAlerts(`Application running on port ${port}`);
});
