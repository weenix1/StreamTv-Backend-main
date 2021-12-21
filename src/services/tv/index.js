import express from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import fs from "fs";
import { dirname, join } from "path";

import q2m from "query-to-mongo";

/* const currentFilePath = fileURLToPath(import.meta.url);
console.log(currentFilePath);

const parentFolderPath = dirname(currentFilePath);

const videoJSONPath = join(parentFolderPath, "books.json");

console.log(videoJSONPath);
 */
//const express = require('express');
//const fs = require("fs");
//const path = require("path");

const tvVideoRouter = express();

/* app.get('/video', (req, res) => {
  res.sendFile('assets/sample.mp4', { root: __dirname });
}); */

/* 
/videos: Returns an array of video metadata that will be used to populate the list of videos in the Home view
/video/:id/data: Returns metadata for a single video. Used by the Player view.
/video/:id: Streams a video with a given ID. Used by the Player view.
/video/:id/poster: Returns a thumbnail for a video with a given ID. Used by the Home view.

 */

tvVideoRouter.get("/", (req, res) => {
  console.log(req.body);

  const fileContent = fs.readFileSync(booksJSONPath);
  console.log(JSON.parse(fileContent));

  const arrayOfBooks = JSON.parse(fileContent);

  res.send(arrayOfBooks);
});

tvVideoRouter.get("/video", (req, res) => {
  res.sendFile("assets/sample.mp4", { root: __dirname });
});

export default tvVideoRouter;
