const express = require("express");
const router = express.Router();
const multer = require("multer");
const Issue = require("../../models/Issue");
const adminAuth = require("../../middleware/adminAuth");
const upload = require("../../middleware/upload");

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


router.post(
  "/",
  adminAuth,
  (req, res, next) => {
    const contentType = req.headers["content-type"] || "";

    if (contentType.startsWith("multipart/form-data")) {
      return upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "pdf", maxCount: 1 },
      ])(req, res, next);
    }

    next();
  },

  async (req, res) => {
    try {
      console.log("REQ BODY:", req.body);

      const { title, slug, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title missing" });
      }

      const pdfFromBody = req.body?.pdf;
      const pdfFromFile = req.files?.pdf?.[0]?.secure_url;

      const imageFromBody = req.body?.coverImage;
      const imageFromFile = req.files?.coverImage?.[0]?.secure_url;

      const finalPdf = pdfFromBody || pdfFromFile;
      const finalImage = imageFromBody || imageFromFile || null;

      if (!finalPdf) {
        return res.status(400).json({ error: "PDF is required" });
      }

      const issue = new Issue({
        title,
        slug,
        description,
        coverImage: finalImage,
        pdf: finalPdf,
        createdAt: req.body.publishDate
          ? new Date(req.body.publishDate)
          : Date.now(),
        isLatest: req.body.isLatest === true || req.body.isLatest === "true",
      });

      if (issue.isLatest) {
        await Issue.updateMany({}, { isLatest: false });
      }

      await issue.save();

      res.json(issue);
    } catch (err) {
      console.error("ISSUE CREATE ERROR:", err);
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
