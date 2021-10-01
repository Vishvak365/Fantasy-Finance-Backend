var express = require("express");
var router = express.Router();
const IEXClient = require("../../IEXClient");
const firebase = require("../../Firebase");
const getCurrPrice = require("./curr_price");
const { isWithinMarketHours, sufficientFunds } = require("./common_functions");
const leagues = firebase.firestore().collection("leagues");

const getLeagueData = async (leagueID) => {
  const data = await leagues.doc(leagueID).get();
  console.log(data.data());
  return data.data();
};
const getUserCash = async (leagueId, uid) => {
  const data = await leagues.doc(leagueId).collection("members").doc(uid).get();
  console.log(data.data());
  return data.data().cash;
};
const getStockQuantity = async (stockName, leagueId, uid) => {
  const data = await leagues
    .doc(leagueId)
    .collection("members")
    .doc(uid)
    .collection("stocks")
    .doc(stockName)
    .get();
  return data.data().quantity;
};

async function buy_stock(req, res) {
  const uid = res.locals.uid;
  console.log(uid);
  const body = req.body;
  console.log(body);
  if ((!body.stockName, !body.quantity, !body.leagueId)) {
    res.status(400);
    res.send({ message: "Insufficient information" });
    return;
  }
  const currStockPrice = await getCurrPrice(body.stockName);
  const leagueData = await getLeagueData(body.leagueId);
  const currUserCash = await getUserCash(body.leagueId, uid);
  console.log("current user case", currUserCash);
  console.log("curr stock price", currStockPrice);
  const checkSufficientFunds = sufficientFunds(
    currUserCash,
    currStockPrice,
    body.quantity
  );
  const checkMarketHours = isWithinMarketHours(
    leagueData.marketHoursOnly,
    body.quantity
  );
  if (!checkMarketHours) {
    res.status(400);
    res.send({ message: "out of market hours" });
    return;
  }
  if (!checkSufficientFunds) {
    res.status(400);
    res.send({ message: "insufficent funds" });
    return;
  }
  const newCash = currUserCash - body.quantity * currStockPrice;
  const leagueQuantity = getStockQuantity(body.stockName, body.leagueId, uid);

  // Updating the User Cash based on the Stock price and Quantity
  try {
    leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .set({
        cash: newCash,
      })
      .then((data) => {
        res.status(200);
        res.json(data);
        return;
      });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "Error updating cash" });
    return;
  }

  // Updating the User's stock quantity
  try {
    leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .collection("stocks")
      .doc(body.stockName)
      .set({
        quantity: leagueQuantity + body.quantity,
      })
      .then((data) => {
        res.status(200);
        res.json(data);
        return;
      });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "Error updating user's share quantity" });
    return;
  }

  res.send("Buying stocks successful");
}
//Checks to make sure that all the information is provided

// TODO Make sure its a whole number
//TODO Check if user has sufficient balance in league DONE
//!TODO Check if market is open (if league only allows market trading)
//!TODO Check day-trading restrictions
//!TODO Get stock price information from IEX
//!TODO Check draft-mode restrictions
//!TODO Check if league is ended

module.exports = { buy_stock };
