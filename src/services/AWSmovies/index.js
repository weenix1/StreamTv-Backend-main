import express from "express";
import fs from "fs";
import util from "util";
import multer from "multer";
import { uploadFile, getFileStream } from "../S3/index.js";
import MovieModel from "./schema.js";
import q2m from "query-to-mongo";
import createHttpError from "http-errors";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "StreamTv-MovieImages",
  },
});

const unlinkFile = util.promisify(fs.unlink);

const upload = multer({ dest: "uploads/" });

const videoRouter = express.Router();

videoRouter.get("/", async (req, res, next) => {
  try {
    const movies = await MovieModel.find();
    if (req.query && req.query.s) {
      const filteredMovies = movies.filter(
        (movie) => movie.title === req.query.s
      );
      res.send(filteredMovies);
    }
    res.send(movies);
  } catch (error) {
    next(error);
  }
});

videoRouter.get("/query", async (req, res, next) => {
  //http://localhost:3002/blogs?limit=2&sort=-author&offset=15
  ///blogs?limit=5&sort=-author&offset=10
  try {
    const mongoQuery = q2m(req.query);
    console.log(mongoQuery);
    const total = await MovieModel.countDocuments(mongoQuery.criteria);
    const movies = await MovieModel.find(mongoQuery.criteria)
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);

    res.send({
      links: mongoQuery.links("/Movies", total),
      pageTotal: Math.ceil(total / mongoQuery.options.limit),
      total,
      movies,
    });
  } catch (error) {
    next(error);
  }
});

videoRouter.get("/:movieId", async (req, res, next) => {
  try {
    const id = req.params.movieId;
    const movie = await MovieModel.findById(id);
    if (movie) {
      res.send(movie);
    } else {
      next(
        createHttpError(404, `movie with id ${req.params.movieId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

videoRouter.put("/:movieId", async (req, res, next) => {
  try {
    const id = req.params.movieId;
    const updatedMovie = await MovieModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (updatedMovie) {
      res.send(updatedMovie);
    } else {
      next(createHttpError(404, `movie with id ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

videoRouter.put(
  "/:movieId/uploadPic",
  multer({ storage: cloudinaryStorage }).single("pic"),
  async (req, res, next) => {
    try {
      console.log(req.file.path);
      const updatedMovie = await MovieModel.findByIdAndUpdate(
        { _id: req.params.movieId },
        { poster: req.file.path },
        { new: true }
      );

      if (updatedMovie) {
        res.send({ message: "Image updated successfully.", updatedMovie });
      } else {
        next(
          createHttpError(404, `No movie found with id: ${req.params.movieId}`)
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

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
  const newMovie = new MovieModel({
    name: name,
    description: description,
    poster: poster,
    videoUrl: `/awsVideos/video/${result.Key}`,
    category: category,
    /*  { $set: { videoUrl: `/videos/${result.Key}` } } */
  });

  await newMovie.save();
  /* const description = req.body.description; */
  res.send({ videoPath: `/awsVideos/video/${result.Key}` });
});

export default videoRouter;
