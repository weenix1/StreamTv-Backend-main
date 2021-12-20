import express from "express";
import UserModel from "./schema.js";
import BlogsModel from "./schema.js";
import { basicAuthMiddleware } from "../../auth/basic.js";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import {
  JWTAuthenticate,
  verifyRefreshAndGenerateTokens,
} from "../../auth/tools.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import passport from "passport";

const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const users = await UserModel.find();
      res.send(users);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get(
  "/me",
  JWTAuthMiddleware,

  async (req, res, next) => {
    try {
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
); // This endpoint receives Google Login requests from our FE, and it is going to redirect them to Google Consent Screen

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    // This endpoint URL needs to match EXACTLY to the one configured on google.cloud dashboard
    try {
      // Thanks to passport.serialize we are going to receive the tokens in the request
      console.log("TOKENS: ", req.user.tokens);

      res.redirect(
        `${process.env.FE_URL}?accessToken=${req.user.tokens.accessToken}&refreshToken=${req.user.tokens.refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get("/me/stories", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const blog = await BlogsModel.find(req.user);
    if (blog) {
      res.send(blog);
      /* res.send(req.user); */
    } else {
      next(createHttpError(404, `Post with the userid ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    /*  req.user.name = "John"; */
    const id = req.user._id.toString();
    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (updatedUser) {
      //await req.user.save();
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `User with id ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put(
  "/:id",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  const me = req.user._id.toString();

  try {
    const deletedUser = await UserModel.findByIdAndDelete(me);
    if (deletedUser) {
      res.send(deletedUser);
    } else {
      next(createHttpError(404, `User with id ${me} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete(
  "/:id",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    const id = req.user._id.toString();

    try {
      const deletedUser = await UserModel.findByIdAndDelete(id);
      if (deletedUser) {
        res.send(deletedUser);
      } else {
        next(createHttpError(404, `User with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Get credentials from req.body
    const { email, password } = req.body;

    // 2. Verify credentials
    const user = await UserModel.checkCredentials(email, password);

    if (user) {
      // 3. If credentials are fine we are going to generate an access token
      const { accessToken, refreshToken } = await JWTAuthenticate(user);
      res.send({ accessToken, refreshToken });
    } else {
      // 4. If they are not --> error (401)
      next(createHttpError(401, "Credentials not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/refreshToken", async (req, res, next) => {
  try {
    // 1. Receive the current refresh token from req.body
    const { currentRefreshToken } = req.body;

    // 2. Check the validity of that (check if it is not expired, check if it hasn't been compromised, check if it is in db)
    const { accessToken, refreshToken } = await verifyRefreshAndGenerateTokens(
      currentRefreshToken
    );
    // 3. If everything is fine --> generate a new pair of tokens (accessToken and refreshToken)

    // 4. Send tokens back as a response
    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
