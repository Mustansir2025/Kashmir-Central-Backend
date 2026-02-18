const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  description: String,

  pdf: { type: String, required: true }, // PDF file path
  coverImage: { type: String }, // optional thumbnail

  isLatest: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Issue", IssueSchema);
