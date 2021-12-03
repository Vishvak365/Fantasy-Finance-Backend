var express = require("express");
var router = express.Router();
const IEXClient = require("../../IEXClient");
const firebase = require("../../Firebase");
const getCurrPrice = require("./curr_price");
const { isWithinMarketHours, sufficientFunds } = require("./common_functions");

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

  //Helper function to check if we are within Market Hours
  const checkMarketHours = isWithinMarketHours(
    leagueData.marketHoursOnly,
    body.quantity
  );

  
  if (!checkMarketHours) {
    res.status(400);
    res.send({ message: "out of market hours" });
    return;
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
    return;
  }

}




module.exports = { sell_stock };
