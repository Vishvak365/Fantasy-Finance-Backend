var express = require("express");
const firebase = require("../../Firebase");
const getCurrPrice = require("./curr_price");
const { isWithinMarketHours, sufficientFunds } = require("./common_functions");
const leagues = firebase.firestore().collection("leagues");
const users = firebase.firestore().collection("users");

const getLeagueData = async (leagueId) => {
  const data = await leagues.doc(leagueId).get();
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
  const body = req.body;
  //!FIXME Fix this logic to ||
  if ((!body.stockName, !body.quantity, !body.leagueId)) {
    res.status(400);
    res.send({ message: "Insufficient information" });
    return;
  }
  const currStockPrice = await getCurrPrice(body.stockName);
  const leagueData = await getLeagueData(body.leagueId);
  const currUserCash = await getUserCash(body.leagueId, uid);

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
  const leagueQuantity = await getStockQuantity(
    body.stockName,
    body.leagueId,
    uid
  );
  console.log("Stock Quantity", leagueQuantity);

  // Updating the User Cash based on the Stock price and Quantity
  try {
    leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .set({
        cash: newCash,
      })
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
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "Error updating user's share quantity" });
    return;
  }

  // Updating the user's history of transactions
  try {
    users 
      .doc(uid)
      .collection("history")
      .doc()
      .set({
        quantity: body.quantity,  
        price: currStockPrice,
        stockName: body.stockName,
        leagueName: leagueData.name,
        leagueId: body.leagueId,
        executed: firebase.firestore.Timestamp.now(),
        action: "buy",
      })
      .then((data) => {
        console.log(data);
        res.send("Buying stocks successful");
        return;
      });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "Error updating user's history" });
    return;
  }
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
