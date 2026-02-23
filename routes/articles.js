const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const upload = require("../middleware/upload");

router.get("/home", async (req, res) => {
  try {
    const Issue = require("../models/Issue");

    const latestIssue = await Issue.findOne({ isLatest: true });

    if (!latestIssue) {
      return res.json({
        heroMain: null,
        heroSide: [],
        latestArticles: [],
      });
    }

    const heroMain = await Article.findOne({
      issue: latestIssue._id,
      heroPosition: "main",
    });

    const heroSide = await Article.find({
      issue: latestIssue._id,
      heroPosition: "side",
    }).limit(2);

    const latestArticles = await Article.find({
      issue: latestIssue._id,
      showInLatest: true,
      heroPosition: null,
    }).sort({ createdAt: -1 });

    // const latestEditorial = await Editorial.findOne({
    //   issue: latestIssue._id,
    // }).sort({ createdAt: -1 });

    res.json({
      heroMain,
      heroSide,
      latestArticles,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };

    // Fix heroPosition
    if (!body.heroPosition || body.heroPosition === "null") {
      body.heroPosition = null;
    }

    // Fix boolean
    body.showInLatest = body.showInLatest === "true";

    const article = new Article({
      ...body,
      image: req.file ? req.file.path : null,
    });

    await article.save();
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const latestArticles = await Article.find({
      issue: latestIssue._id,
      showInLatest: true,
      $or: [{ heroPosition: null }, { heroPosition: { $exists: false } }],
    }).sort({ createdAt: -1 });

    res.json(latestArticles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/category/:name", async (req, res) => {
  const Issue = require("../models/Issue");

  const latestIssue = await Issue.findOne({ isLatest: true });
  if (!latestIssue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  const articles = await Article.find({
    issue: latestIssue._id,
    category: req.params.name,
  }).sort({ createdAt: -1 });

  res.json(articles);
});

// related articles
// GET RELATED ARTICLES (SMART PRIORITY: same issue first, then same category)
router.get("/related/:slug", async (req, res) => {
  try {
    const currentArticle = await Article.findOne({ slug: req.params.slug });

    if (!currentArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    const MAX_RELATED = 6;

    // 1️⃣ Same issue (exclude current article)
    let related = await Article.find({
      _id: { $ne: currentArticle._id },
      issue: currentArticle.issue,
    })
      .sort({ createdAt: -1 })
      .limit(MAX_RELATED);

    // 2️⃣ Fill remaining slots with same category (from other issues)
    if (related.length < MAX_RELATED) {
      const remainingCount = MAX_RELATED - related.length;

      const additional = await Article.find({
        _id: { $ne: currentArticle._id, $nin: related.map((a) => a._id) },
        category: currentArticle.category,
      })
        .sort({ createdAt: -1 })
        .limit(remainingCount);

      related = related.concat(additional);
    }

    res.json(related);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ARTICLES (ADMIN)
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find()
      .populate("issue", "title")
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ARTICLE
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
    };

    if (req.file) {
      updatedData.image = req.file.path;
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true },
    );
    if (!updatedData.heroPosition || updatedData.heroPosition === "") {
      updatedData.heroPosition = null;
    }

    // normalize boolean
    updatedData.showInLatest =
      updatedData.showInLatest === "true" || updatedData.showInLatest === true;

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ARTICLE
router.delete("/:id", async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/hero/main/:id", async (req, res) => {
  await Article.updateMany({}, { heroPosition: null });

  const article = await Article.findByIdAndUpdate(
    req.params.id,
    { heroPosition: "main" },
    { new: true },
  );

  res.json(article);
});

router.put("/hero/side/:id", async (req, res) => {
  const sideHeroes = await Article.find({ heroPosition: "side" }).sort({
    createdAt: 1,
  });

  if (sideHeroes.length >= 2) {
    await Article.findByIdAndUpdate(sideHeroes[0]._id, { heroPosition: null });
  }

  const article = await Article.findByIdAndUpdate(
    req.params.id,
    { heroPosition: "side" },
    { new: true },
  );

  res.json(article);
});

router.put("/hero/remove/:id", async (req, res) => {
  const article = await Article.findByIdAndUpdate(
    req.params.id,
    { heroPosition: null },
    { new: true },
  );

  res.json(article);
});

router.put("/latest/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);

  article.showInLatest = !article.showInLatest;
  await article.save();

  res.json(article);
});

router.get("/id/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.json(article);
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Update ONLY safe fields
    article.title = req.body.title;
    article.slug = req.body.slug;
    article.category = req.body.category;
    article.issue = req.body.issue;
    article.content = req.body.content;
    article.description = req.body.description;

    if (req.body.heroPosition === "") {
      article.heroPosition = null;
    }

    if (req.file) {
      article.image = req.file.path;
    }

    // DO NOT TOUCH:
    // heroPosition
    // showInLatest

    await article.save();
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ARTICLES (ADMIN)
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find()
      .populate("issue", "title")
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE ARTICLE BY SLUG
router.get("/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
