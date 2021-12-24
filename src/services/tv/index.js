import express from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import fs from "fs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import q2m from "query-to-mongo";
import thumbsupply from "thumbsupply";

/* const currentFilePath = fileURLToPath(import.meta.url);
console.log(currentFilePath);

const parentFolderPath = dirname(currentFilePath);

const videoJSONPath = join(parentFolderPath, "books.json");

console.log(videoJSONPath);
 */
//const express = require('express');
//const fs = require("fs");
//const path = require("path");

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const videosFilePath = path.join(__dirname, "assets/sample.mp4");
console.log("here is videofile", videosFilePath);

const tvVideoRouter = express.Router();

/* app.get('/video', (req, res) => {
  res.sendFile('assets/sample.mp4', { root: __dirname });
}); */

/* 
/videos: Returns an array of video metadata that will be used to populate the list of videos in the Home view
/video/:id/data: Returns metadata for a single video. Used by the Player view.
/video/:id: Streams a video with a given ID. Used by the Player view.
/video/:id/poster: Returns a thumbnail for a video with a given ID. Used by the Home view.

 */
/* 
tvVideoRouter.get("/", (req, res) => {
  console.log(req.body);

  const fileContent = fs.readFileSync(booksJSONPath);
  console.log(JSON.parse(fileContent));

  const arrayOfBooks = JSON.parse(fileContent);

  res.send(arrayOfBooks);
}); */

tvVideoRouter.get("/", async (req, res) => {
  try {
    const fileAsBuffer = fs.readFileSync(videosFilePath);
    const fileAsString = fileAsBuffer.toString();
    const fileAsJSON = JSON.parse(fileAsString);
    res.send(fileAsJSON);
  } catch (error) {
    res.send({ message: error.message });
  }
});

tvVideoRouter.get("/video", (req, res) => {
  res.sendFile("assets/sample.mp4", { root: __dirname });
});

tvVideoRouter.get("/video/:id/data", (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.json(videos[id]);
});

tvVideoRouter.get("/video/:id", (req, res) => {
  const path = `assets/${req.params.id}.mp4`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

tvVideoRouter.get("/video/:id/poster", (req, res) => {
  thumbsupply
    .generateThumbnail(`assets/${req.params.id}.mp4`)
    .then((thumb) => res.sendFile(thumb));
});

export default tvVideoRouter;
