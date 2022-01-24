var express = require("express");
var router = express.Router();
const Article = require("../models/article");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/spiderProtocol", (req, res) => {
  res.json({
    code: 0,
    protocol: {
      name: "FULL_NET_SPIDER_PROTOCOL",
      version: "0.1",
    },
    config: {
      contentList: {
        url: "https://localhost:11111/content",
        pageSizeLimit: 20,
        frequencyLimit: 5,
      },
    },
  });
});

router.get("/content", (req, res) => {
  (async () => {
    const { pageSize, latestId } = req.body;
    const match = {};
    if (latestId) {
      match._id = { $gt: latestId };
    }
    const articles = await Article.model
      .find(match)
      .sort({ _id: 1 })
      .limit(Number(pageSize) || 10);

    const contentList = [];
    for (let a of articles) {
      contentList.push({
        zhihuId: a._doc.article.zhihuId,
        title: a._doc.article.title,
        contentType: "dom", // link, fNull-text, dom, video, audio
        content: {
          html: a._doc.article.articleContentHtml,
          text: a._doc.article.articleContent,
        },
        tags: a._doc.article.tags,
        contentId: a._id,
      });
    }
    return {
      contentList,
    };
  })()
    .then((r) => {
      res.json(r);
    })
    .catch((e) => {});
});

module.exports = router;
