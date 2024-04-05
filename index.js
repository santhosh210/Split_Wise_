const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/groups");
const expenseRouter = require("./routes/expenses");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const sendAlerts = require("./helpers/telegramBot");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
-app.use(helmet());
app.use(compression());
app.use("/users", userRouter);
app.use("/groups", groupRouter);
app.use("/expenses", expenseRouter);
app.get("/", (req, res) => {
  res.send("welcome to Splitwise");
});

app.listen(4000, () => {
  console.log("listening at http://localhost:4000");
  sendAlerts("Application running on port 4000");
});
