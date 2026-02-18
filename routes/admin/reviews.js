const express = require("express");
const router = express.Router();
const multer = require("multer");
const BookReview = require("../../models/Review");
const auth = require("../../middleware/adminAuth"); // same middleware used in other admin routes

// =============================
// MULTER CONFIG
// =============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/reviews");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// =============================
// CREATE REVIEW
// POST /api/admin/reviews
// =============================
router.post("/", auth, upload.single("coverImage"), async (req, res) => {
  try {
    const { bookTitle, reviewer, excerpt, content, slug, featured } = req.body;

    const review = new BookReview({
      bookTitle,
      reviewer,
      excerpt,
      content,
      slug,
      featured: featured === "true" || featured === true,
      coverImage: req.file ? req.file.path : "",
    });

    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// GET ALL REVIEWS (ADMIN PANEL)
// GET /api/admin/reviews
// =============================
router.get("/", auth, async (req, res) => {
  try {
    const reviews = await BookReview.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// GET SINGLE REVIEW
// GET /api/admin/reviews/:id
// =============================
router.get("/:id", auth, async (req, res) => {
  try {
    const review = await BookReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// UPDATE REVIEW
// PUT /api/admin/reviews/:id
// =============================
router.put("/:id", auth, upload.single("coverImage"), async (req, res) => {
  try {
    const updateData = {
      bookTitle: req.body.bookTitle,
      reviewer: req.body.reviewer,
      excerpt: req.body.excerpt,
      content: req.body.content,
      slug: req.body.slug,
      featured: req.body.featured === "true" || req.body.featured === true,
    };

    // If new image uploaded
    if (req.file) {
      updateData.coverImage = req.file.path;
    }

    const review = await BookReview.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// DELETE REVIEW
// DELETE /api/admin/reviews/:id
// =============================
router.delete("/:id", auth, async (req, res) => {
  try {
    await BookReview.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// TOGGLE FEATURED
// PATCH /api/admin/reviews/:id/featured
// =============================
router.patch("/:id/featured", auth, async (req, res) => {
  try {
    const review = await BookReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.featured = !review.featured;
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
