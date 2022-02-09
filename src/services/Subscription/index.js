import express from "express";
import path from "path";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
