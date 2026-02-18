const express = require("express");
const router = express.Router();
const Editorial = require("../models/Editorial");

/* Latest editorial */
router.get("/latestEditorial", async (req, res) => {
  try {
    const editorial = await Editorial.findOne()
      .populate("issue", "title")
      .sort({ createdAt: -1 });

    res.json(editorial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* Get by issue */
router.get("/latest", async (req, res) => {
  try {
    const Issue = require("../models/Issue");

    const latestIssue = await Issue.findOne({ isLatest: true });

    if (!latestIssue) {
      return res.json({
        editorial,
      });
    }
    const editorial = await Editorial.find({
      issue: latestIssue._id,
    }).populate("issue", "title");

    res.json({ editorial });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* Single editorial */
router.get("/:id", async (req, res) => {
  try {
    const editorial = await Editorial.findById(req.params.id);
    res.json(editorial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
