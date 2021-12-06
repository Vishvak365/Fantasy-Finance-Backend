var express = require("express");
const firebase = require("../../Firebase");
const getCurrPrice = require("./curr_price");
const leagues = firebase.firestore().collection("leagues");
const users = firebase.firestore().collection("users");
async function portfolio_value(req, res) {
  //Override to use query uid if present, else current user info is used
  const uid = req.query.uid ? req.query.uid : res.locals.uid;
  const leagueId = req.query.leagueId;
  const league = await leagues
    .doc(leagueId)
    .collection("members")
    .doc(uid)
    .collection("stocks")
    .get();
  let portfolioProfits = [];
  for (i = 0; i < league.docs.length; i++) {
    const stockName = league.docs[i].id;
    const holdingsData = league.docs[i].data();
    const stock_profit = await get_portfolio_stock_profit(
      stockName,
      holdingsData
    );
    const profit = {
      stock: stockName,
      profit: stock_profit,
      averagePrice: holdingsData.avgPrice,
      quantity: holdingsData.quantity,
      totalValue: stock_profit + holdingsData.quantity * holdingsData.avgPrice,
    };
    portfolioProfits.push(profit);
  }
  res.json(portfolioProfits);
}
// Calculate portfolio value per stock
async function portfolio_value_stock(req, res) {
  const stockName = req.query.stockName;
  const uid = req.query.uid ? req.query.uid : res.locals.uid;
  const leagueId = req.query.leagueId;
  const league = await leagues
    .doc(leagueId)
    .collection("members")
    .doc(uid)
    .collection("stocks")
    .doc(stockName)
    .get();
  if (league.exists) {
    const stockName = league.id;
    const holdingsData = league.data();
    const stock_profit = await get_portfolio_stock_profit(
      stockName,
      holdingsData
    );
    const profit = {
      stock: stockName,
      profit: stock_profit,
      averagePrice: holdingsData.avgPrice,
      quantity: holdingsData.quantity,
      totalValue: stock_profit + holdingsData.quantity * holdingsData.avgPrice,
    };
    res.json(profit);
    return;
  } else {
    res.status(200).json({});
    return;
  }
}
async function get_portfolio_stock_profit(stockName, holdingsData) {
  const curr_stock_price = await getCurrPrice(stockName);
  const stock_value = curr_stock_price * holdingsData.quantity;
  return stock_value - holdingsData.quantity * holdingsData.avgPrice;
}
module.exports = { portfolio_value, portfolio_value_stock };
