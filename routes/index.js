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
        url: "https://localhost:3000/content",
        pageSizeLimit: 20,
        frequencyLimit: 5,
      },
    },
  });
});

router.get("/content", (req, res) => {
  (async () => {
    const { pageSize, latestId } = req.query;
    const match = {};
    if (latestId) {
      match._id = { $gte: latestId };
    }
    const articles = await Article.model
      .find(match)
      .sort({ _id: 1 })
      .limit(Number(pageSize) || 10);

    const contentList = [];
    for (let a of articles) {
      console.log(a.zhihuId);
      contentList.push({
        zhihuId: a.zhihuId,
        title: a.title,
        contentType: "dom", // link, fNull-text, dom, video, audio
        content: {
          html: a.articleContentHtml,
          text: a.articleContent,
        },
        tags: a.tags,
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
