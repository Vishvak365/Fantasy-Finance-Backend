const express = require("express");
const app = express();
const dotenv = require("dotenv");
const firebase = require("./Firebase");
const account = require("./Routes/account");
const trade = require("./Routes/trade");
var cors = require("cors");
dotenv.config();

app.use(cors());

app.use("/account", account);
app.use("/trade", trade);
app.get("/", (req, res) => {
  res.send("Authenticated");
});

module.exports = app;
