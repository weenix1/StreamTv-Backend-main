import MovieModel from "./schema.js";
import q2m from "query-to-mongo";
import fs from "fs-extra";

const { readJSON, writeJSON, createReadStream } = fs;

const addMovies = async (req, res, next) => {
  try {
    const videoPath = fs.createReadStream(req.file.path);

    const { name, description, poster, videoUrl, category } = req.body;
    const newMovie = new MovieModel(
      name,
      description,
      poster,
      videoUrl,
      category,
      { $set: { videoUrl: videoPath } }
    );

    await newMovie.save();

    res.status(201).send({ newMovie });
  } catch (error) {
    next(error);
  }
};

const moviesHandler = {
  addMovies,
};

export default moviesHandler;
