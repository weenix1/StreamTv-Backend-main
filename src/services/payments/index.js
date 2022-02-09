import express from "express";
import path from "path";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const paymentRouter = express.Router();

paymentRouter.post("/", async (req, res) => {
  const { product } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: product.amount * 100,
        },
        quantity: product.quantity,
      },
    ],
    mode: "payment",
    success_url: `${process.env.MY_DOMAIN}/success`,
    cancel_url: `${process.env.MY_DOMAIN}/cancel`,
  });

  res.json({ id: session.id });
});

paymentRouter.post("/create-payment-intent", async (req, res) => {
  const { paymentMethodType, currency } = req.body;

  // Each payment method type has support for different currencies. In order to
  // support many payment method types and several currencies, this server
  // endpoint accepts both the payment method type and the currency as
  // parameters.
  //
  // Some example payment method types include `card`, `ideal`, and `alipay`.
  const params = {
    payment_method_types: [paymentMethodType],
    amount: 1999,
    currency: currency,
  };

  // If this is for an ACSS payment, we add payment_method_options to create
  // the Mandate.
  if (paymentMethodType === "acss_debit") {
    params.payment_method_options = {
      acss_debit: {
        mandate_options: {
          payment_schedule: "sporadic",
          transaction_type: "personal",
        },
      },
    };
  }

  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  try {
    const paymentIntent = await stripe.paymentIntents.create(params);

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

export default paymentRouter;
