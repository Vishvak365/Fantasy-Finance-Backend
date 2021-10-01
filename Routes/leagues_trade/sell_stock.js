var express = require("express");
var router = express.Router();
const IEXClient = require("../../IEXClient");
const firebase = require("../../Firebase");

const leagues = firebase.firestore().collection("leagues");
const users = firebase.firestore().collection("users");

async function sell_stock(req, res) {
    const uid = res.locals.uid;
    const body = req.body;
    
    // Get league info about initial capital
    const startingCapital = await getLeagueInitialCapital(body.leagueID);
    leagues
      .doc(body.leagueID)
      .collection("members")
      .doc(body.uid)
      .set({
        cash: startingCapital,
        addedBy: uid,
        addedOn: firebase.firestore.Timestamp.now(),
      })
      .then((data) => {
        res.status(200);
        res.json(data);
        return;
      });

    //Call Vishvak's Curr Price function to get the price of the stock that is being sold

    getStockPricex

    //Update the users current profit/loss using the userID

    //Use the userID to determine the 



}

module.exports = { sell_stock };