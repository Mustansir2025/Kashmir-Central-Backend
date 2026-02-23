const express = require("express");
const router = express.Router();
const multer = require("multer");
const News = require("../../models/News");
const adminAuth = require("../../middleware/adminAuth");
const upload = require("../../middleware/upload");
// // STORAGE CONFIG
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/news");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

/* =========================
   CREATE NEWS (POST)
   ========================= */
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const news = new News({
      title: req.body.title,
      author: req.body.author,
      slug: req.body.slug,
      description: req.body.description,
      content: req.body.content,
      category: req.body.category,
      image: req.file ? req.file.path : null,
    });

    await news.save();
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET ALL NEWS (ADMIN PANEL)
   ========================= */
router.get("/", adminAuth, async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SINGLE NEWS
   ========================= */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE NEWS
   ========================= */
router.put("/:id", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      author: req.body.author,
      slug: req.body.slug,
      description: req.body.description,
      content: req.body.content,
      category: req.body.category,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await News.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE NEWS
   ========================= */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "News deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
