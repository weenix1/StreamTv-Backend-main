import express from "express";
import fs from "fs";
import util from "util";
import multer from "multer";
import { uploadFile, getFileStream } from "../S3/index.js";
import MovieModel from "./schema.js";
import q2m from "query-to-mongo";

const unlinkFile = util.promisify(fs.unlink);

const upload = multer({ dest: "uploads/" });

const videoRouter = express.Router();

videoRouter.get("/video/:key", (req, res) => {
  console.log(req.params);
  const key = req.params.key;
  const readStream = getFileStream(key);

  readStream.pipe(res);
});

videoRouter.post("/", upload.single("video"), async (req, res) => {
  const file = req.file;
  console.log(file);

  // apply filter
  // resize
  const { name, description, poster, videoUrl, category } = req.body;

  const result = await uploadFile(file);
  await unlinkFile(file.path);
  console.log(result);
  const newMovie = new MovieModel(
    name,
    description,
    poster,
    videoUrl,
    category,
    { $set: { videoUrl: `/videos/${result.Key}` } }
  );

  await newMovie.save();
  /* const description = req.body.description; */
  res.send({ videoPath: `/videos/${result.Key}` });
});

export default videoRouter;
