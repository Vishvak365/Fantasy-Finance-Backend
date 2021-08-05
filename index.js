const express = require("express");
const app = express();
const dotenv = require("dotenv");
const firebase = require("./Firebase");
const account = require("./Routes/account");
const trade = require("./Routes/trade");
dotenv.config();

app.use("/account", account);
app.use("/trade", trade);
app.get("/", (req, res) => {
  res.send("Authenticated");
});

module.exports = app;
