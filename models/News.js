const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },

  author: {
    type: String,
    required: true,
  },

  slug: { type: String, required: true, unique: true },

  description: { type: String, required: true }, // shown on homepage card

  content: { type: String, required: true }, // full news page

  category: {
    type: String,
    enum: ["politics", "society", "security", "culture", "sports"],
    required: true,
  },

  image: { type: String }, // multer path

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("News", NewsSchema);
