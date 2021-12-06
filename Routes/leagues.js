var express = require("express");
var router = express.Router();
const { buy_stock } = require("./leagues_trade/buy_stock");
const { sell_stock } = require("./leagues_trade/sell_stock");
const firebase = require("../Firebase");
const {
  getLeagueData,
  getUserData,
} = require("./leagues_trade/common_functions");

const leagues = firebase.firestore().collection("leagues");
router.post("/trade/buy_stock", buy_stock);
// const samplePost = {
//   name: "Fantasy Finance League XYZ",
//   dayTrading: true,
//   marketHoursOnly: true,
//   startingCapital: 45000,
//   //optionalx
//   draftMode: {
//     draftEnd: 3242830480329,
//   },
// };

router.post("/trade/sell_stock", sell_stock);

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
  if (!body.leagueID) {
    console.log("no leagueID");
    res.status(400);
    res.send({ message: "Insufficient information to add user to league" });
    return;
  }
  //Check Firebase Firestore to make sure that league ID collection exists
  const leagueID = body.leagueID;
  const league = await leagues.doc(leagueID).get();
  if (!league.exists) {
    res.status(400);
    res.send({ message: "League does not exist" });
    return;
  }
  //Check Firebase firestore to make sure that user is not already in league collection
  const user = await leagues.doc(leagueID).collection("members").doc(uid).get();
  if (user.exists) {
    res.status(400);
    res.send({ message: "User is already in league" });
    return;
  }
  // get users name from User's collection
  const memberData = await firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get();

  try {
    // Get league info about initial capital
    const startingCapital = await getLeagueInitialCapital(body.leagueID);
    // Add user to league in leagues collection
    leagues.doc(body.leagueID).collection("members").doc(uid).set({
      cash: startingCapital,
      addedBy: uid,
      userName: memberData.data().name,
      addedOn: firebase.firestore.Timestamp.now(),
    });
    // Add league id and league name in user collection
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("leagues")
      .doc(body.leagueID)
      .set({
        leagueID: body.leagueID,
        leagueName: league.data().name,
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
// Endpoint to get all leagues that a user is a part of
router.get("/getUserLeagues", async function (req, res) {
  const uid = res.locals.uid;
  try {
    const leagues = await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("leagues")
      .get();
    const leagueData = leagues.docs.map((doc) => doc.data());
    res.status(200);
    res.json(leagueData);
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "error in getting user leagues" });
  }
});

// Endpoint to get all history of a user

router.get("/getUserHistory", async function (req, res) {
  const uid = res.locals.uid;

  console.log("user", uid);
  try {
    const history = await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("history")
      .limit(10)
      .get();
    const historyData = [];
    history.docs.map((doc) =>
      historyData.push({
        leagueID: doc.data().leagueId,
        leagueName: doc.data().leagueName,
        date: doc.data().executed,
        stock: doc.data().stockName,
        quantity: doc.data().quantity,
        action: doc.data().action,
        price: doc.data().price,
      })
    );
    res.status(200);
    res.json(historyData);
    // console.log(historyData);
  } catch (exception) {
    console.log("Error", exception);
    res.status(500);
    res.send({ message: "error in getting user history" });
  }
});

//Endpoint to get all the members in a league on league page
router.get("/getMembers", async function (req, res) {
  const body = req.query.leagueId;
  try {
    const leagues = await firebase
      .firestore()
      .collection("leagues")
      .doc(body)
      .collection("members")
      .get();
    const leagueData = leagues.docs.map((doc) => doc.data()); //Is this needed?
    res.status(200);
    res.json(leagueData);
    console.log(leagueData);
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "error in getting members in this league" });
  }
});

router.get("/leagueInfo", async function (req, res) {
  const leagueId = req.query.leagueId;
  const leagueData = await getLeagueData(leagueId);
  console.log(leagueData);
  res.send(leagueData);
});

router.get("/userCash", async function (req, res) {
  const uid = res.locals.uid;
  const leagueId = req.query.leagueId;
  const userCash = await getUserData(leagueId, uid);
  res.send({ userCash: userCash.cash });
});
module.exports = router;
