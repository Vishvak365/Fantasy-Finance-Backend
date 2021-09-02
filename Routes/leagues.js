var express = require("express");
var router = express.Router();
const firebase = require("../Firebase");

const samplePost = {
  name: "Fantasy Finance League XYZ",
  dayTrading: true,
  marketHoursOnly: true,
  startingCapital: 45000,
  //optional
  draftMode: {
    draftEnd: 3242830480329,
  },
};

router.post("/create", function (req, res) {
  const uid = res.locals.uid;
  const body = req.body;

  //Checks to make sure that all the information is provided
  if (
    !body.name ||
    !body.dayTrading ||
    !body.marketHoursOnly ||
    !body.startingCapital
  ) {
    res.status(400);
    res.send({ message: "Insufficient information to create league" });
    return;
  }
  try {
    firebase
      .firestore()
      .collection("leagues")
      .doc()
      .set({
        ...body,
        creator: uid,
        created: firebase.firestore.Timestamp.now(),
      })
      .then((data) => {
        res.status(200);
        res.json(data);
        return;
      });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "error in creating league" });
  }
});

module.exports = router;
