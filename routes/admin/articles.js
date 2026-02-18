const express = require("express");
const router = express.Router();
const Article = require("../../models/Article");
const upload = require("../../middleware/upload");
const adminAuth = require("../../middleware/adminAuth");

// GET ALL
router.get("/", adminAuth, async (req, res) => {
  const articles = await Article.find()
    .populate("issue", "title")
    .sort({ createdAt: -1 });

  res.json(articles);
});

// GET BY ID
router.get("/id/:id", adminAuth, async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.json(article);
});

// CREATE
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };

    // FIX heroPosition
    if (body.heroPosition === "null" || body.heroPosition === "") {
      body.heroPosition = null;
    }

    // FIX boolean
    body.showInLatest = body.showInLatest === "true";

    const article = new Article({
      ...body,
      image: req.file ? req.file.path : null,
    });

    await article.save();
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.heroPosition === "null" || body.heroPosition === "") {
      body.heroPosition = null;
    }

    body.showInLatest =
      body.showInLatest === "true" || body.showInLatest === true;

    if (req.file) {
      body.image = req.file.path;
    }

    const article = await Article.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", adminAuth, async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// HERO MAIN (toggle)
router.put("/hero/main/:id", adminAuth, async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (article.heroPosition === "main") {
    article.heroPosition = null;
  } else {
    await Article.updateMany({}, { heroPosition: null });
    article.heroPosition = "main";
    article.showInLatest = false;
  }

  await article.save();
  res.json(article);
});

// HERO SIDE (toggle)
router.put("/hero/side/:id", adminAuth, async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (article.heroPosition === "side") {
    article.heroPosition = null;
  } else {
    const sides = await Article.find({ heroPosition: "side" });
    if (sides.length >= 2) {
      sides[0].heroPosition = null;
      await sides[0].save();
    }

    article.heroPosition = "side";
    article.showInLatest = false;
  }

  await article.save();
  res.json(article);
});

// TOGGLE LATEST
router.put("/latest/:id", adminAuth, async (req, res) => {
  const article = await Article.findById(req.params.id);

  article.showInLatest = !article.showInLatest;

  if (article.showInLatest) {
    article.heroPosition = null;
  }

  await article.save();
  res.json(article);
});

module.exports = router;
