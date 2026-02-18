const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");

/* ===============================
   GET LATEST ISSUE
================================ */
router.get("/latest", async (req, res) => {
  try {
    const issue = await Issue.findOne({ isLatest: true });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET ALL ISSUES
================================ */
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET SINGLE ISSUE
================================ */
router.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
