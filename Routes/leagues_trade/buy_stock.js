var express = require("express");
const firebase = require("../../Firebase");
const getCurrPrice = require("./curr_price");
const {
  isWithinMarketHours,
  sufficientFunds,
  getUser,
  getLeagueData,
} = require("./common_functions");
const leagues = firebase.firestore().collection("leagues");
const users = firebase.firestore().collection("users");

const getStockQuantity = async (stockName, leagueId, uid) => {
  try {
    const data = await leagues
      .doc(leagueId)
      .collection("members")
      .doc(uid)
      .collection("stocks")
      .doc(stockName)
      .get();
    return data.data().quantity;
  } catch (exception) {
    console.log("exception", exception);
    return 0;
  }
};
const getstockAvgPrice = async (stockName, leagueId, uid) => {
  try {
    const data = await leagues
      .doc(leagueId)
      .collection("members")
      .doc(uid)
      .collection("stocks")
      .doc(stockName)
      .get();
    return data.data().avgPrice;
  } catch (exception) {
    console.log("exception", exception);
    return 0;
  }
};

async function buy_stock(req, res) {
  const uid = res.locals.uid;
  const body = req.body;
  console.log("body", body);
  //!FIXME Fix this logic to ||
  if ((!body.stockName, !body.quantity, !body.leagueId)) {
    res.status(400);
    res.send({ message: "Insufficient information" });
    return;
  }
  console.log("UserID", uid);
  const currStockPrice = await getCurrPrice(body.stockName);

  const leagueData = await getLeagueData(body.leagueId);
  const currUser = await getUser(body.leagueId, uid);
  const currUserCash = currUser.cash;

  const checkSufficientFunds = sufficientFunds(
    currUserCash,
    currStockPrice,
    body.quantity
  );
  const checkMarketHours = isWithinMarketHours(
    leagueData.marketHoursOnly,
    body.quantity
  );

  if (body.quantity < 1) {
    res.status(400);
    res.send({ message: "Quantity must be greater than 0" });
    return;
  }
  if (!checkMarketHours) {
    res.status(400);
    res.send({ message: "Out of market hours" });
    return;
  }
  if (!checkSufficientFunds) {
    res.status(400);
    res.send({ message: "Insufficent funds" });
    return;
  }
  console.log("user", currUser);
  const newCash = currUserCash - body.quantity * currStockPrice;
  const stockQuantity = await getStockQuantity(
    body.stockName,
    body.leagueId,
    uid
  );
  const stockAvgPrice = await getstockAvgPrice(
    body.stockName,
    body.leagueId,
    uid
  );
  console.log("Stock Quantity", stockQuantity);

  // Updating the User Cash based on the Stock price and Quantity
  try {
    leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .set({
        ...currUser,
        cash: newCash,
      });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "Error updating cash" });
    return;
  }

  // Updating the User's stock quantity
  const newStockQuantity = parseInt(stockQuantity) + parseInt(body.quantity);

  const currAvgPrice =
    (stockQuantity * stockAvgPrice + body.quantity * currStockPrice) /
    newStockQuantity;
  try {
    leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .collection("stocks")
      .doc(body.stockName)
      .set({
        quantity: newStockQuantity,
        avgPrice: currAvgPrice,
      });
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
