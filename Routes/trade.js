var express = require("express");
var router = express.Router();
const firebase = require("../Firebase");

router.get("/makeTrade", function (req, res) {
  const uid = res.locals.uid;
  const stockName = req.query.stockName;
  const action = req.query.action;
  firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("history")
    .doc()
    .set({
      action: action,
      stock: stockName,
      executed: firebase.firestore.Timestamp.now(),
    })
    .catch((error) => {
      console.log(error);
      res.status(500);
      res.json({ message: "Unable to execute trade" });
    });
  res.status(202);
  res.json({ message: "successfully traded" });
});

router.get("/history", function (req, res) {
  const uid = res.locals.uid;
  let history = [];
  firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("history")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        history.push(doc.data());
      });
    })
    .then(() => {
      res.json(history);
    });
});

module.exports = router;
