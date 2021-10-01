var express = require("express");
var router = express.Router();
const firebase = require("../Firebase");
const newLocal = "firebase/";
var admin = require("firebase-admin")

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
        .doc()
        .set({
          ...body,
          user: uid,
          name: userRecord.displayName,
          Premium: false,
          created: firebase.firestore.Timestamp.now()
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
    console.log('Error fetching user data:', error);
  });

});
module.exports = router;