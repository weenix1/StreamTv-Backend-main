import express from "express";
import path, { resolve } from "path";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const subscriptionRouter = express.Router();

subscriptionRouter.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    success_url:
      "https://streamtv-eta.vercel.app/success?id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://streamtv-eta.vercel.app/cancel",
    payment_method_types: [""],
    mode: "",
    line_items: [
      {
        price: "prod_L7dpBdL02xCLCh",
        quantity: req.body.quantity,
      },
    ],
  });
  res.json({
    id: session.id,
  });
});

subscriptionRouter.get("/success", (req, res) => {
  const path = resolve(process.env.FE_URL);
  res.sendFile(path);
});

export default subscriptionRouter;
