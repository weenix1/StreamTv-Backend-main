import express from "express";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import moviesHandler from "./handlers.js";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "StreamTv" },
});

const movieRouter = express.Router();

movieRouter
  .route("/video")
  .post(
    multer({ storage: cloudinaryStorage }).single("videofile"),
    moviesHandler.addMovies
  );

export default movieRouter;
