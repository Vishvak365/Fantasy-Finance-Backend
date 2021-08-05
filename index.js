const express = require("express");
const app = express();
const dotenv = require("dotenv");
const firebase = require("./Firebase");
const account = require("./Routes/account");
dotenv.config();

app.use("/account", account);
app.get("/", (req, res) => {
  const uid = "aklsdjfalksdjf";
  firebase
    .firestore()
    .collection("users")
    .doc(uid)
    // .update({
    //   arrayField: firebase.firestore.FieldValue.arrayUnion("greater_virginia"),
    // })
    .set({
      test: "test",
      anotherField: "alkasdfasdfasdfsdjf",
      evenMoreField: "alkdsjf",
      arrayField: [{ timeExecuted: 23423544213413, stock: "aapl" }],
    })
    .catch((error) => {
      console.log(error);
    });
  res.send("Authenticated");
});

module.exports = app;
