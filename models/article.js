const mongoose = require("mongoose");
const { Schema } = mongoose;

const articleSchema = new Schema({
  zhihuId: String,
  title: String, //单个内容的名字
  content: String,
  articleContentHtml: String,
  createAt: { type: Number, default: Date.now.valueOf() },
  originCreatedAt: Number,
  Column: String,
  tags: [
    {
      name: String,
      value: String,
      score: Number,
    },
  ],
});

articleSchema.set("collection", "article");

const articleModel = mongoose.model("article", articleSchema);

module.exports = {
  model: articleModel,
};
