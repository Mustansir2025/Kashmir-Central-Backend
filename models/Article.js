const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true,
  },

  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  category: {
    type: String,
    required: true,
    enum: ["politics", "society", "security", "culture", "sports"],
  },

  author: { type: String, required: true },

  description: { type: String, required: true }, // used in cards
  content: { type: String, required: true }, // full article page

  image: { type: String }, // multer file path

  // HERO CONTROL
  heroPosition: {
    type: String,
    enum: ["main", "side", null],
    default: null,
  },

  // LATEST ARTICLES CONTROL
  showInLatest: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Article", ArticleSchema);
