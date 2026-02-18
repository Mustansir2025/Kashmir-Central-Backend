const express = require("express");
const router = express.Router();
const multer = require("multer");

const Editorial = require("../../models/Editorial");
const Issue = require("../../models/Issue");
const adminAuth = require("../../middleware/adminAuth");

// Multer config (same style as reviews/articles)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/editorials");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* =========================
   CREATE EDITORIAL
========================= */
router.post("/", adminAuth, upload.single("coverImage"), async (req, res) => {
  try {
    const { title, author, content, issue } = req.body;

    // Enforce ONE editorial per issue
    const existing = await Editorial.findOne({ issue });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Editorial already exists for this issue" });
    }

    const editorial = new Editorial({
      title,
      author,
      content,
      issue,
      coverImage: req.file ? req.file.path : "",
    });

    await editorial.save();

    res.json(editorial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET ALL EDITORIALS
========================= */
router.get("/", adminAuth, async (req, res) => {
  try {
    const editorials = await Editorial.find()
      .populate("issue", "title")
      .sort({ createdAt: -1 });

    res.json(editorials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET SINGLE EDITORIAL
========================= */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const editorial = await Editorial.findById(req.params.id).populate(
      "issue",
      "title",
    );

    res.json(editorial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE EDITORIAL
========================= */
router.put("/:id", adminAuth, upload.single("coverImage"), async (req, res) => {
  try {
    const { title, author, content, issue } = req.body;

    const editorial = await Editorial.findById(req.params.id);

    if (!editorial) {
      return res.status(404).json({ message: "Editorial not found" });
    }

    // Check if another editorial exists for same issue
    const existing = await Editorial.findOne({
      issue,
      _id: { $ne: req.params.id },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Another editorial already exists for this issue" });
    }

    editorial.title = title;
    editorial.author = author;
    editorial.content = content;
    editorial.issue = issue;

    if (req.file) {
      editorial.coverImage = req.file.path;
    }

    await editorial.save();

    res.json(editorial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   DELETE EDITORIAL
========================= */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Editorial.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
