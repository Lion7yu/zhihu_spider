const winston = require("winston");
require("winston-daily-rotate-file");
const { transports, Logger } = winston;
const { DailyRotateFile } = transports;

const logger = new Logger({
  transports: [
    new DailyRotateFile({
      name: "base_logger",
      filename: "./logs/info.log",
      prepend: false,
      datePattern: "YYYY-MM-DD",
      level: "info",
    }),
    new DailyRotateFile({
      name: "error_logger",
      filename: "./logs/error.log",
      prepend: false,
      datePattern: "YYYY-MM-DD",
      level: "error",
    }),
  ],
});

module.exports = logger;
