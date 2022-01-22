const MongoClient = require("mongodb").MongoClient;
const logger = require("../utils/loggers/logger");

async function recalculateTagScores() {
  const db = await MongoClient.connect("mongodb://localhost:27017/zhihu");
  const zhihuDB = await db.db("zhihu");
  const cursor = await zhihuDB.collection("articles").find({}, { article: 1 });
  // while(await cursor.hasNext()){}
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const recalculatedColumn = [];
    const recalculatedTags = [];
    const articleColumn = doc.article.column.map((t) => {
      t.value = t.value ? t.value : "无专栏";
      return {
        name: t.name,
        value: t.value,
        score: 1,
      };
    });
    const titleTags = doc.article.tags
      .filter((t) => t.name === "ARTICLE_TAG_TITLE")
      .sort((prev, next) => next.score - prev.score)
      .map((e, i, a) => {
        return {
          name: e.name,
          value: e.value,
          score: e.score / a[0].score,
        };
      });
    const sysTags = doc.article.tags
      .filter((t) => t.name === "ARTICLE_TAG_SYS")
      .map((t) => {
        return {
          name: t.name,
          value: t.value,
          score: 0.7,
        };
      });
    recalculatedColumn.push(...articleColumn);
    recalculatedTags.push(...titleTags);
    recalculatedTags.push(...sysTags);

    await zhihuDB
      .collection("articles")
      .updateOne(
        { _id: doc._id },
        { $set: { "article.tags": recalculatedTags } }
      );
    await zhihuDB
      .collection("articles")
      .updateOne(
        { _id: doc._id },
        { $set: { "article.column": recalculatedColumn } }
      );
  }
}

switch (process.argv[2]) {
  case "recalculate_tag_scores":
    recalculateTagScores()
      .then((r) => {
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
        logger.error("error executing script for recalculating tag scores", {
          err: e,
        });
        process.exit(1);
      });
    break;
}
