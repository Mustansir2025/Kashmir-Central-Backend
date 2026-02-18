const mongoose = require("mongoose");

const BookReviewSchema = new mongoose.Schema({
  // issue: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Issue",
  //   required: true,
  // },

  bookTitle: { type: String, required: true },
  reviewer: { type: String, required: true },

  excerpt: { type: String }, // shown in big featured card
  content: { type: String }, // full review page later

  coverImage: { type: String },

  slug: { type: String, required: true, unique: true },

  featured: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BookReview", BookReviewSchema);
