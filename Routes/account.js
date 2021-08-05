var express = require("express");
var router = express.Router();
const firebase = require("../Firebase");

router.get("/test", function (req, res) {
  res.send("alsdkjf");
});

module.exports = router;
