const RedisService = require("../services/content_id.service");
const Spider = require("../services/spider_service");

switch (process.argv[2] || process.env.NODE_ARGV_2) {
  case "generate_ids":
    RedisService.generateZhihuIdsToRedis(
      Number(process.argv[3]),
      Number(process.argv[4])
    )
      .then((r) => {
        console.log("done");
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
    break;

  case "start_getting_articles":
    // Spider.spideringArticles(Number(process.argv[3]))
    getArticlesBG()
      .then((r) => {
        console.log("done");
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
    break;

  case "get_single_article":
    Spider.getSingleArticle(process.argv[3])
      .then((r) => {
        console.log("done");
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
    break;
}

async function getArticlesBG() {
  const remainingCount = await RedisService.getRemainingIDCount();
  const numbersPerTime = 5;
  while (remainingCount >= 5) {
    await Spider.spideringArticles(numbersPerTime)
      .then((r) => {
        console.log(r);
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
