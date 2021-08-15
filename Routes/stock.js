var express = require("express");
var router = express.Router();
var yahooFinance = require('yahoo-finance');

router.get("/", function (req, res) {
  const uid = res.locals.uid;
  yahooFinance.quote({
    symbol: 'GOOG',
    modules: ['price'] // see the docs for the full list
  }, function (err, quotes) {
    console.log(quotes.price['regularMarketPrice'])
  });
  res.send("")
});

module.exports = router;
