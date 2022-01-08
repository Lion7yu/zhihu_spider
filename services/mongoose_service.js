const mongoose = require("mongoose");
const logger = require("../utils/loggers/app_logger");

mongoose.Promise = Promise;

const uri = `mongodb://localhost:27017/zhihu`;
mongoose.connect(uri, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("open", () => {
  console.log("db connected!");
});

db.on("error", (e) => {
  console.log(e);
});

module.exports = db;
