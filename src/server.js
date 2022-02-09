import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
  unauthorizedHandler,
  forbiddenHandler,
} from "./errorHandlers.js";
import cors from "cors";
import passport from "passport";
import GoogleStrategy from "./auth/oauth.js";
import usersRouter from "./services/users/index.js";
/* import tvVideoRouter from "./services/tv/index.js"; */
import paymentRouter from "./services/payments/index.js";

import videoRouter from "./services/AWSmovies/index.js";
import subscriptionRouter from "./services/Subscription/index.js";

const server = express();

const port = process.env.PORT;
// ********************************* MIDDLEWARES ***************************************
passport.use("google", GoogleStrategy);

server.use(cors());
server.use(express.json());
server.use(passport.initialize());

// ********************************* ROUTES ********************************************

server.use("/users", usersRouter);
/* server.use("/videos", tvVideoRouter); */
server.use("/payment", paymentRouter);

server.use("/awsVideos", videoRouter);
server.use("/subscription", subscriptionRouter);

// ********************************* ERROR HANDLERS ************************************
server.use(unauthorizedHandler);
server.use(forbiddenHandler);

server.use(notFoundHandler);
server.use(badRequestHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("Mongo Connected");

  server.listen(port, () => {
    console.table(listEndpoints(server));

    console.log(`Server running on port ${port}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
