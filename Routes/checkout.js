var express = require("express");
var router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const firebase = require("../Firebase");
const jwt = require("jsonwebtoken");

router.post("/", async function (req, res) {
  console.log("Creating checkout URL");
  const token = req.query.token;
  // const redirectURL = "http://localhost:8080/checkout/sessioninfo";
  const redirectURL =
    "https://fantasy-finance-backend.herokuapp.com/checkout/sessioninfo";
  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1JPc3nKA8XHS3puIMwH9liX8",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${redirectURL}/?success=true&session_id={CHECKOUT_SESSION_ID}&token=${token}`,
      cancel_url: `${req.headers.origin}`,
    });

    res.redirect(303, session.url);
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message);
  }
});

router.get("/sessioninfo", async function (req, res) {
  console.log("Checkout completed");
  // const frontendURL = "http://localhost:8080";
  const frontendURL = "https://fantasyfinance.vishvak.com";
  try {
    const user_token = req.query.token;
    const sessionID = req.query.session_id;
    const session = await stripe.checkout.sessions.retrieve(sessionID);
    console.log(user_token);
    console.log(session);

    //Change premium status to true for user in Firebase Firestore
    //decode jwt token
    const decoded = jwt.decode(user_token);
    const userID = decoded.user_id;
    await firebase
      .firestore()
      .collection("users")
      .doc(userID)
      .set({ premium: true }, { merge: true });

    //todo create success page
    res.redirect(303, frontendURL);
  } catch (err) {
    //todo create error page
    console.log(err);
    res.redirect(303, frontendURL);
  }
});

module.exports = router;
