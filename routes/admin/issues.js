const express = require("express");
const router = express.Router();
const multer = require("multer");
const Issue = require("../../models/Issue");
const adminAuth = require("../../middleware/adminAuth");

// STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/issues");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ===============================
   Get all ISSUEs
================================ */
router.get("/", adminAuth, async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   CREATE ISSUE
================================ */
router.post(
  "/",
  adminAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files?.pdf) {
        return res.status(400).json({ error: "PDF is required" });
      }

      const issue = new Issue({
        title: req.body.title,
        slug: req.body.slug,
        description: req.body.description,
        createdAt: req.body.publishDate || Date.now(),
        isLatest: req.body.isLatest === "true",
        coverImage: req.files.coverImage ? req.files.coverImage[0].path : null,
        pdf: req.files.pdf[0].path,
      });

      // Only one latest issue allowed
      if (issue.isLatest) {
        await Issue.updateMany({}, { isLatest: false });
      }

      await issue.save();
      res.json(issue);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
);

/* ===============================
   DELETE ISSUE
================================ */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   SET LATEST ISSUE
================================ */
router.put("/:id/latest", adminAuth, async (req, res) => {
  try {
    await Issue.updateMany({}, { isLatest: false });

    await Issue.findByIdAndUpdate(req.params.id, {
      isLatest: true,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   UPDATE ISSUE
================================ */
router.put(
  "/:id",
  adminAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const updateData = {
        title: req.body.title,
        slug: req.body.slug,
        description: req.body.description,
        isLatest: req.body.isLatest === "true",
      };

      if (req.files?.coverImage)
        updateData.coverImage = req.files.coverImage[0].path;

      if (req.files?.pdf) updateData.pdf = req.files.pdf[0].path;

      // Only one latest issue allowed
      if (updateData.isLatest) {
        await Issue.updateMany({}, { isLatest: false });
      }

      const issue = await Issue.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });

      res.json(issue);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
