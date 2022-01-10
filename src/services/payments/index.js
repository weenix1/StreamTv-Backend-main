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

export default paymentRouter;
