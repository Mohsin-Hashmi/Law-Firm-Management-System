

const express = require('express');
const stripeIntentRouter = express.Router();
const createPaymentIntent = require("../controllers/stripe.controller")

stripeIntentRouter.post('/create-payment-intent', createPaymentIntent)

module.exports = stripeIntentRouter;