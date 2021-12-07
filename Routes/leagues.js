var express = require("express");
var router = express.Router();
const { buy_stock } = require("./leagues_trade/buy_stock");
const { sell_stock } = require("./leagues_trade/sell_stock");
const firebase = require("../Firebase");
const {
  getLeagueData,
  getUserData,
} = require("./leagues_trade/common_functions");
const {
  portfolio_value,
  portfolio_value_stock,
} = require("./leagues_trade/portfolio_value");

const leagues = firebase.firestore().collection("leagues");
router.post("/trade/buy_stock", buy_stock);

router.post("/trade/sell_stock", sell_stock);

router.get("/portfolioValue/total", portfolio_value);
router.get("/portfolioValue/stock", portfolio_value_stock);
// Endpoint to create new league
router.post("/create", function (req, res) {
  const uid = res.locals.uid;
  const body = req.body;

  //Checks to make sure that all the information is provided
  console.log(body.dayTrading, body.marketHoursOnly);
  if (!body.name || !body.startingCapital) {
    res.status(400);
    res.send({ message: "Insufficient information to create league" });
    return;
  }

  const checkLeagueCount = firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get();
  checkLeagueCount.then((doc) => {
    if (doc.data().leagues >= 3 && doc.data().premium === false) {
      console.log("User has reached max leagues");
      res.status(400);
      res.send({ message: "You have reached the maximum number of leagues" });
      return;
    }
  });

  try {
    leagues
      .add({
        ...body,
        creator: uid,
        created: firebase.firestore.Timestamp.now(),
      })
      .then((docRef) => {
        try {
          addUserToLeague(docRef.id, uid).then((data) => {
            res.status(200);
            res.send({ message: "League created successfully", data });
            res.send({ message: "League created", leagueID: docRef.id });
            return;
          });
        } catch (exception) {
          res.status(500);
          res.send({ message: "error in adding user to league" });
        }
      });
  } catch (exception) {
    console.log(exception);
    res.status(500);
    res.send({ message: "error in creating league" });
  }
});

const addUserToLeague = async (leagueID, uid) => {
  const league = await leagues.doc(leagueID).get();
  const leagueData = league.data();
  // get users name from User's collection
  const memberData = await firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get();

  try {
    // Get league info about initial capital
    const startingCapital = await getLeagueInitialCapital(leagueID);
    // Add user to league in leagues collection
    leagues.doc(leagueID).collection("members").doc(uid).set({
      cash: startingCapital,
      addedBy: uid,
      userName: memberData.data().name,
      addedOn: firebase.firestore.Timestamp.now(),
    });
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("leagues")
      .doc(leagueID)
      .set({
        leagueID: leagueID,
        leagueName: leagueData.name,
      })
      .then((data) => {
        firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .update({ leagues: firebase.firestore.FieldValue.increment(1) });
        return data;
      });
  } catch (exception) {
    console.log(exception);
    return;
  }
};

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

  const checkLeagueCount = firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get();
  checkLeagueCount.then((doc) => {
    if (doc.data().leagues >= 3 && doc.data().premium === false) {
      console.log("User has reached max leagues");
      res.status(400);
      res.send({ message: "You have reached the maximum number of leagues" });
      return;
    }
  });
  const user = await leagues.doc(leagueID).collection("members").doc(uid).get();

  if (user.exists) {
    res.status(400);
    res.send({ message: "User is already in league" });
    return;
  }

  try {
    addUserToLeague(leagueID, uid).then(() => {
      res.status(200);
      res.send({ message: "User added to league" });
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
    const league = await firebase
      .firestore()
      .collection("leagues")
      .doc(body)
      .collection("members")
      .get();
    let league_users = [];
    for (i = 0; i < league.docs.length; i++) {
      const user_id = league.docs[i].id;
      const user_data = league.docs[i].data();
      league_users.push({ user_id, ...user_data });
    }
    // const leagueData = leagues.docs.map((doc) => doc.data()); //Is this needed?
    // res.status(200);
    res.json(league_users);
    // console.log(leagueData);
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

router.get("/userLeagueInfo", async function (req, res) {
  const uid = req.query.uid ? req.query.uid : res.locals.uid;
  const leagueId = req.query.leagueId;
  const userData = await getUserData(leagueId, uid);
  res.send(userData);
});

router.get("/userCash", async function (req, res) {
  const uid = res.locals.uid;
  const leagueId = req.query.leagueId;
  const userCash = await getUserData(leagueId, uid);
  res.send({ userCash: userCash.cash });
});
module.exports = router;
