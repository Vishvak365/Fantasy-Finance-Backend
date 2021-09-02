var express = require("express");
var router = express.Router();
const firebase = require("../Firebase");

const leagues = firebase.firestore().collection("leagues");

const samplePost = {
  name: "Fantasy Finance League XYZ",
  dayTrading: true,
  marketHoursOnly: true,
  startingCapital: 45000,
  //optionalx
  draftMode: {
    draftEnd: 3242830480329,
  },
};

// Endpoint to create new league
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
    leagues
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

async function getLeagueInitialCapital(leagueID) {
  const data = await leagues.doc(leagueID).get();
  return data.data().startingCapital;
}
router.post("/addUser", async function (req, res) {
  const uid = res.locals.uid;
  const body = req.body;
  if (!body.uid || !body.leagueID) {
    res.status(400);
    res.send({ message: "Insufficient information to add user to league" });
    return;
  }
  try {
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
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "error in adding user to league" });
  }
});
module.exports = router;
