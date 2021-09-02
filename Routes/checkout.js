var express = require("express");
var router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);

router.post("/", async function (req, res) {
  const token = req.query.token
  // const redirectURL = 'http://localhost:8080/checkout/sessioninfo'
  const redirectURL = 'https://fantasy-finance-backend.herokuapp.com/checkout/sessioninfo'
  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [
        'card',
      ],
      line_items: [
        {
          price: 'price_1JPc3nKA8XHS3puIMwH9liX8',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${redirectURL}/?success=true&session_id={CHECKOUT_SESSION_ID}&token=${token}`,
      cancel_url: `${req.headers.origin}`,
    });

    res.redirect(303, session.url);
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message);
  }
});

router.get("/sessioninfo", async function (req, res) {
  const frontendURL = 'https://fantasyfinance.vishvak.com'
  const user_token = req.query.token
  const sessionID = req.query.session_id
  const session = await stripe.checkout.sessions.retrieve(sessionID)
  console.log(session)
  res.redirect(303, frontendURL);
})

module.exports = router;
