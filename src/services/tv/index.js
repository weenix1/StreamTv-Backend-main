import express from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import q2m from "query-to-mongo";
import thumbsupply from "thumbsupply";

/* const express = require("express");
const fs = require("fs");
const path = require("path");


 */

const videos = [
  {
    id: 0,
    poster: "/video/0/poster",
    duration: "3 mins",
    name: "Sample 1",
  },
  {
    id: 1,
    poster: "/video/1/poster",
    duration: "4 mins",
    name: "Sample 2",
  },
  {
    id: 2,
    poster: "/video/2/poster",
    duration: "2 mins",
    name: "Sample 3",
  },
];

const tvVideoRouter = express.Router();

//Function to generate an email

/* 
/videos: Returns an array of video metadata that will be used to populate the list of videos in the Home view
/video/:id/data: Returns metadata for a single video. Used by the Player view.
/video/:id: Streams a video with a given ID. Used by the Player view.
/video/:id/poster: Returns a thumbnail for a video with a given ID. Used by the Home view.

 */

tvVideoRouter.get("/:id/data", (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.json(videos[id]);
});

/* tvVideoRouter.get("/video", (req, res) => {
  const path = `assets/2.mp4`;

  const stat = fs.statSync(path);

  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    console.log("we have range", range);
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    console.log(parts);

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
    console.log("no range", range);
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
}); */

tvVideoRouter.get("/:id/poster", (req, res) => {
  thumbsupply
    .generateThumbnail(`assets/${req.params.id}.mp4`)
    .then((thumb) => res.sendFile(thumb))
    .catch((err) => console.log(err));
});

tvVideoRouter.get("/:id", (req, res) => {
  const path = `assets/${req.params.id}.mp4`;

  const stat = fs.statSync(path);

  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const CHUNK_SIZE = 10 ** 6; //1MB
    console.log("we have range", range);
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) + CHUNK_SIZE : fileSize - 1;
    console.log(parts);

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path /* { start, end } */);
    /* const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head); */
    file.pipe(res);
  } else {
    console.log("no range", range);
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

export default tvVideoRouter;
