import mongoose from "mongoose";
const { Schema, model } = mongoose;

const MovieSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    poster: { type: String, required: true },
    videoUrl: { type: String, required: false },
    category: { type: String, required: false },
  },
  { timestamps: true }
);

export default model("MovieModel", MovieSchema);
