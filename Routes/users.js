var express = require("express");
var router = express.Router();
const firebase = require("../Firebase");
const newLocal = "firebase/";
var admin = require("firebase-admin");

const users = firebase.firestore().collection("users");

router.post("/createUser", (req, res) => {
  const uid = res.locals.uid;
  const body = req.body;

  admin
    .auth()
    .getUser(uid)
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      // console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
      try {
        users
          .doc(uid)
          .set({
            ...body,
            user: uid,
            name: userRecord.displayName,
            premium: false,
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
        res.send({ message: "error in creating user" });
      }
    })
    .catch((error) => {
      console.log("Error fetching user data:", error);
    });
});

//endpoint to see if user has a premium account
router.get("/isPremium", (req, res) => {
  const uid = res.locals.uid;
  users
    .doc(uid)
    .get()
    .then((data) => {
      if (!data.data().premium) {
        res.status(200);
        res.json({
          message: false,
        });
        return;
      } else {
        res.status(200);
        res.json({
          message: true,
        });
        return;
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500);
      res.send({ message: "error in getting user" });
    });
});
module.exports = router;
