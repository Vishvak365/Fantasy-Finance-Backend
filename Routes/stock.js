var express = require("express");
var router = express.Router();
var yahooFinance = require("yahoo-finance");
const getCurrPrice = require("./leagues_trade/curr_price");
router.get("/", function (req, res) {
  const uid = res.locals.uid;
  yahooFinance.quote(
    {
      symbol: "GOOG",
      modules: ["price"], // see the docs for the full list
    },
    function (err, quotes) {
      console.log(quotes.price["regularMarketPrice"]);
    }
  );
  res.send("");
});
router.get("/currentPrice", async function (req, res) {
  const stockName = req.query.stockName;
  if (!stockName) {
    res.status(300);
    res.send({ message: "include 'stockName' query param" });
    return;
  }
  const stockPrice = await getCurrPrice(stockName);
  console.log(stockPrice);
  res.status(200);
  res.send({ price: stockPrice });
});
module.exports = router;
