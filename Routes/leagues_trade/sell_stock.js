var express = require("express");
var router = express.Router();
const IEXClient = require("../../IEXClient");
const firebase = require("../../Firebase");
const getCurrPrice = require("./curr_price");

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

async function sell_stock(req, res) {
  const uid = res.locals.uid;
  const leagueId = res.locals.leagueId;
  const body = req.body;
  const currStockPrice = await getCurrPrice();
  //const stockName = ;
  //const quantity = ;

  //Checks if all the sufficient information is provided for sell_stock function
  if ((!body.quantity, !body.leagueId, !body.stockName)) {
    res.status(400);
    res.send({ message: "Insufficient information" });
    return;
  }

  //Helper functin from Munish
  if (!isWithinMarketHours) {
  }

  //Adding the sold capital to the current capital of the user
  try {
    leagues
      .doc(body.leagueID)
      .collection("members")
      .doc(uid)
      .set({
        cash: startingCapital + currStockPrice,
      })
      .then((data) => {
        res.status(200);
        res.json(data);
        return;
      });

    //Adjusting the quantity after selling a stock
    leagues
      .doc(body.leagueID)
      .collection("members")
      .doc(uid)
      .collection("stocks")
      .doc(body.stockName)
      .set({
        quantity: oldQuantity - body.quantity,
      });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "error in selling the stock" });
  }

  //Call Vishvak's Curr Price function to get the price of the stock that is being sold

  //Update the users current profit/loss using the userID

  //Use the userID to determine the
}

//Checks if the user already owns the stock before allowing them to sell
function userOwnsStock(req, res) {
try{
    leagues
    .doc(body.leagueID)
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

//Checks if time is from 9:30am - 4:00pm (Market Hours), from Munish
async function isWithinMarketHours(req, res) {
    let date = new Date();
    return true;
}

module.exports = { sell_stock };
