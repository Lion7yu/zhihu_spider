const Production = {
  logger: {
    path: "var/logs/zhihu",
  },
  mongo: {
    url: "mongodb://localhost:27017/zhihu",
  },
  elasticsearch: {
    host: "localhost:9200",
  },
};

const Debug = {
  logger: {
    path: "./logs/",
  },
  mongo: {
    url: "mongodb://localhost:27017/zhihu",
  },
  elasticsearch: {
    host: "localhost:9200",
  },
};

if (process.env.NODE_ENV === "production") {
  module.exports = Production;
} else {
  module.exports = Debug;
}
