var express = require("express");
var router = express.Router();
const getCurrPrice = require("./leagues_trade/curr_price");
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
