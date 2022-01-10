const Production = {
  logger: {
    path: "var/logs/what_you_love",
  },
  mongo: {
    url: "mongodb://localhost:27017/what_you_love",
  },
};

const Debug = {
  logger: {
    path: "./logs/",
  },
  mongo: {
    url: "mongodb://localhost:27017/what_you_love",
  },
};

if (process.env.NODE_ENV === "production") {
  module.exports = Production;
} else {
  module.exports = Debug;
}
