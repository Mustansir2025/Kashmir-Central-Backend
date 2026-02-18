const express = require("express");
const router = express.Router();
const multer = require("multer");
const News = require("../models/News");

// STORAGE CONFIG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/news");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* GET ALL NEWS (LATEST FIRST) */
router.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET SINGLE NEWS BY SLUG */
router.get("/:slug", async (req, res) => {
  try {
    const item = await News.findOne({ slug: req.params.slug });

    if (!item) return res.status(404).json({ message: "News not found" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET RELATED NEWS (SMART: same issue first, then same category)
// GET RELATED NEWS (SMART: same issue first, then same category)
router.get("/related/:slug", async (req, res) => {
  try {
    const currentNews = await News.findOne({ slug: req.params.slug });

    if (!currentNews) {
      return res.status(404).json({ message: "News not found" });
    }

    const related = await News.find({
      _id: { $ne: currentNews._id },
      category: currentNews.category,
    })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(related);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
