const redis = require("./redis_service");

const ZHIHU_ID_SET_REDIS_KEY = "zhihu_id_set";
const ZHIHU_ARTICLE_GOT_ID_SET = "zhihu_article_got_id_set";

async function generateZhihuIdsToRedis(min, max) {
  const ITERATION = 10000;
  const t1 = Date.now().valueOf();
  const arr = new Array(ITERATION);
  for (let i = min; i < max; i++) {
    for (let j = 0; j < ITERATION; j++) {
      const v = i * ITERATION + j;
      arr[j] = v;
    }
    await redis.sadd(ZHIHU_ID_SET_REDIS_KEY, arr);
  }
  const t2 = Date.now().valueOf();
  console.log(t2 - t1);
}

async function getRandomZhihuIds(count) {
  const ids = await redis.spop(ZHIHU_ID_SET_REDIS_KEY, count);
  return ids;
}

async function markArticleIdSucceed(id) {
  await redis.sadd(ZHIHU_ARTICLE_GOT_ID_SET, id);
}

async function idBackInPool(id) {
  await redis.sadd(ZHIHU_ID_SET_REDIS_KEY, id);
}

async function getRemainingIDCount() {
  const idCount = await redis.scard(ZHIHU_ID_SET_REDIS_KEY);
  return idCount;
}

module.exports = {
  generateZhihuIdsToRedis,
  getRandomZhihuIds,
  markArticleIdSucceed,
  idBackInPool,
  getRemainingIDCount,
};
