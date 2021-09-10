var express = require("express");
var router = express.Router();
const IEXClient = require("../../IEXClient");
const firebase = require("../../Firebase");

const leagues = firebase.firestore().collection("leagues");

async function buy_stock(req, res) {
  const uid = res.locals.uid;
  const body = req.body;
  const data = await IEXClient.get("/tops?symbols=snap,tsla");

  console.log(data);
  //Checks to make sure that all the information is provided
  if ((!body.stockName, !body.quantity, !body.leagueId)) {
    res.status(400);
    res.send({ message: "Insufficient information" });
    return;
  }
  //!TODO Check if user has sufficient balance in league
  //!TODO Check if market is open (if league only allows market trading)
  //!TODO Check day-trading restrictions
  //!TODO Get stock price information from IEX
  //!TODO Check draft-mode restrictions
  //!TODO Check if league is ended
  res.send("");
}
module.exports = { buy_stock };
