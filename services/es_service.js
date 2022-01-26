const { Client } = require("@elastic/elasticsearch");
const logger = require("../utils/loggers/logger");
const es = new Client({ node: "http://localhost:9200" });

const CONTENT_INDEX = "zhihu";
const CONTENT_TYPE = "article";

const article = require("../models/article");

function normalizeTagScores(tags) {
  const totalScore = tags.reduce((p, n) => {
    return p + n.score;
  }, 0);
  return tags.map((t) => {
    const newTag = Object.assign({}, t);
    newTag.score /= totalScore;
    return newTag;
  });
}

async function createOrUpdateContent(article) {
  const doc = {
    title: article.title,
    tags: article.tags,
    serviceId: article.zhihuId,
  };
  await es.update({
    index: CONTENT_INDEX,
    type: CONTENT_TYPE,
    id: article.zhihuId.toString(),
    body: {
      doc: doc,
      upsert: doc,
    },
  });
}

async function createOrUpdateContents(articles) {
  const ps = [];
  for (let article of articles) {
    ps.push(createOrUpdateContent(article));
  }
  await Promise.all(ps);
}

module.exports = {
  createOrUpdateContent,
  createOrUpdateContents,
};
