const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    snippet: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    votes: {
      type: [Number], // Array di numeri per i voti
      default: [], // Inizializza come array vuoto
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: [
      {
        username: { type: String, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }, // Data di creazione per ogni commento
      },
    ],
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
