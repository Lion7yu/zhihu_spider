require("./mongoose_service");
const axios = require("axios");
const cherrio = require("cheerio");
const RedisServer = require("./content_id_service");
const moment = require("moment");
const jieba = require("@node-rs/jieba");
const ESService = require("../services/es_service");

const Article = require("../models/article");

class Tag {
  constructor(name, value, score) {
    this.name = name;
    this.value = value;
    this.score = score;
  }
}
async function spideringArticles(count) {
  const ids = await RedisServer.getRandomZhihuIds(count);
  console.log(ids);
  let errCount = 0;
  let succeedCount = 0;
  for (let id of ids) {
    await getSingleArticle(id)
      .then((r) => {
        succeedCount++;
      })
      .catch((e) => {
        errCount++;
        if (e.errorCode !== 4040000) throw e;
      });
    await new Promise((res) => {
      setTimeout(res, 1000);
    });
  }
  return {
    succeedCount,
    errCount,
  };
}

async function getSingleArticle(id) {
  const res = await axios
    .get(`https://zhuanlan.zhihu.com/p/${id}`)
    .catch((e) => {
      if (e.response && e.response.status && e.response.status == 404) {
        const err = new Error("Not Found");
        err.errorCode = 4040000;
        throw err;
      } else {
        throw e;
      }
    });

  const html = res.data;
  const $ = cherrio.load(html);
  const articleContent = $("article");
  const tags = [];
  const title = $(".Post-Header").children(".Post-Title").text();
  const titleTags = jieba.extract(title, 5);
  for (const t of titleTags) {
    tags.push(new Tag("ARTICLE_TAG_TITLE", t.keyword, t.weight));
  }
  const originalCreateAt = moment(
    $(".ContentItem-time").text().split(" ")[1],
    "YYYY年MM月dd日 hh:mm:ss"
  ).valueOf();
  const articleColumnName = $(
    ".ColumnLink.ColumnPageHeader-TitleColumn"
  ).text();

  $(".TopicList")
    .children(".Tag.Topic")
    .map((i, el) => {
      tags.push(new Tag("ARTICLE_TAG_SYS", $(el).text(), 1));
    });

  // console.log(tags);

  if (!articleContent) {
    return;
  } else {
    await RedisServer.markArticleIdSucceed(id);
  }
  const dom = $(articleContent);
  const content = getTextOrImg(dom, []);

  function getTextOrImg(dom, arr) {
    const d = $(dom);
    const children = d.children();
    if (children.length === 0) {
      if (d.text()) {
        arr.push(d.text());
      }
      if (d["0"].name === "img") {
        arr.push(d.attr("src"));
      }
    } else {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        getTextOrImg(child, arr);
      }
    }
    return arr;
  }

  const article = {
    zhihuId: id,
    content: content,
    articleContentHtml: articleContent.html(),
    createAt: Date.now().valueOf(),
    originCreatedAt: originalCreateAt,
    Column: articleColumnName,
    title: title, //单个内容的名字
    tags: tags,
  };

  const result = await Article.model.findOneAndUpdate(
    {
      zhihuId: id,
    },
    { $set: { article } },
    {
      upsert: true,
      returnNewDocument: true,
    }
  );
  // return result;
  return ESService.createOrUpdateContents(result);
}

module.exports = {
  spideringArticles,
  getSingleArticle,
};
