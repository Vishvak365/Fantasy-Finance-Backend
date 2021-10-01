var express = require("express");
var router = express.Router();
const IEXClient = require("../../IEXClient");
const firebase = require("../../Firebase");

const leagues = firebase.firestore().collection("leagues");

async function buy_stock(req, res) {
  const uid = res.locals.uid;
  const body = req.body;
  const data = await IEXClient.get("/tops?symbols=snap,fb");

  console.log(data);
  //Checks to make sure that all the information is provided
  if ((!body.stockName, !body.quantity, !body.leagueId)) {
    res.status(400);
    res.send({ message: "Insufficient information" });
    return;
  }

  //If users balance is > lastSalePrice of stock, then user can buy stock
  //Else, provide error that user does not have enough balance to buy stock

  //Identify how to set up market is open for a certain time of day, if time is after "certain time", 
  //then user is not able to buy_stock

  //How long is draft mode, is this still a current option?

  //If league has ended, user is not allowed to buy stock

  //Once the user has bought a stock, the stock information has to be sent to calculate the user's
  //overall profit or loss, according to the lastSalePrice of when they stock was bought



  //!TODO Check if user has sufficient balance in league
  //!TODO Check if market is open (if league only allows market trading)
  //!TODO Check day-trading restrictions
  //!TODO Get stock price information from IEX
  //!TODO Check draft-mode restrictions
  //!TODO Check if league is ended
  res.send("");
}
module.exports = { buy_stock };
