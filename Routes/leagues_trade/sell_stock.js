var express = require("express");
var router = express.Router();
const IEXClient = require("../../IEXClient");
const firebase = require("../../Firebase");
const getCurrPrice = require("./curr_price");
const {
  isWithinMarketHours,
  sufficientFunds,
  getUserData,
  getLeagueData,
} = require("./common_functions");

// const { isWithinMarketHours, sufficientFunds } = require("./common_functions");

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

const leagues = firebase.firestore().collection("leagues");
const users = firebase.firestore().collection("users");

async function getLeagueInitialCapital(leagueID) {
  const data = await leagues.doc(leagueID).get();
  return data.data().startingCapital;
}

const getUserCash = (leagueId, uid) => {
  const data = leagues.doc(leagueId).collection("members").doc(uid).get();
  return data.data().cash;
};

//Checks if the user already owns the stock before allowing them to sell
function userOwnsStock(req, res) {
  try {
    leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .collection("stocks")
      .doc(body.stockName)
      .get();
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "Do not own this stock" });
  }
}

async function sell_stock(req, res) {
  const uid = res.locals.uid;
  const body = req.body;
  //Checks if all the sufficient information is provided for sell_stock function
  if ((!body.quantity, !body.leagueId, !body.stockName)) {
    res.status(400);
    res.send({ message: "Insufficient information" });
    return;
  }
  const stockName = body.stockName;
  const currStockPrice = await getCurrPrice(stockName);

  const leagueData = await getLeagueData(body.leagueId);
  const currUser = await getUserData(body.leagueId, uid);
  const currUserCash = currUser.cash;
  const startingCapital = await getLeagueInitialCapital(body.leagueId);
  const stockQuantity = await getStockQuantity(
    body.stockName,
    body.leagueId,
    uid
  );
  // console.log(
  //   "asdkfjalsdkjflaksdjf",
  //   currUserCash,
  //   stockQuantity,
  //   currStockPrice
  // );
  // console.log("USER STOCK QUANTITY + 0", stockQuantity);

  // console.log(leagueData);

  //Helper function to check if we are within Market Hours
  try {
    leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .collection("stocks")
      .doc(body.stockName)
      .get();
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "Do not own this stock" });
  }
  const checkMarketHours = isWithinMarketHours(
    leagueData.marketHoursOnly,
    body.quantity
  );

  if (!checkMarketHours) {
    res.status(400);
    res.send({ message: "out of market hours" });
    return;
  }
  if (stockQuantity < body.quantity || stockQuantity === 0) {
    res.status(400);
    res.json({ message: "Not enough shares to sell" });
    return;
  }

  try {
    await leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .update({
        cash: currUserCash + currStockPrice * body.quantity,
      });

    //Adjusting the quantity after selling a stock
    await leagues
      .doc(body.leagueId)
      .collection("members")
      .doc(uid)
      .collection("stocks")
      .doc(body.stockName)
      .update({
        quantity: stockQuantity - body.quantity,
      });
    // res.status(200);
    // res.json({ message: "successfully sold shares" });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "error in selling the stock" });
    return;
  }

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
        action: "sell",
      })
      .then(() => {
        res.status(200);
        res.send({ message: "successfully sold shares" });
        return;
      });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "error in selling the stock" });
    return;
  }
}

module.exports = { sell_stock };
