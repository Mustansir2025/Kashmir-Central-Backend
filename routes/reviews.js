const express = require("express");
const router = express.Router();
const multer = require("multer");
const BookReview = require("../models/Review");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/reviews");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Get all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await BookReview.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get featured review (for homepage)
// Get featured review (for homepage)
router.get("/featured", async (req, res) => {
  try {
    const MAX_OTHERS = 3; // limit number of other reviews shown

    const featuredReview = await BookReview.findOne({ featured: true });

    // Get other reviews excluding the featured one, limit to MAX_OTHERS
    const others = await BookReview.find({ featured: false })
      .sort({ createdAt: -1 })
      .limit(MAX_OTHERS);

    res.json({ featuredReview, others });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single review by slug
router.get("/:slug", async (req, res) => {
  try {
    const review = await BookReview.findOne({ slug: req.params.slug });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
