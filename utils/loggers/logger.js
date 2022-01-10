const loggerSetting = require("../../setting").logger;
const winston = require("winston");
require("winston-daily-rotate-file");

const { transports } = winston;
const { DailyRotateFile } = transports;

const logger = new winston.createLogger({
  transports: [
    new DailyRotateFile({
      name: "base_logger",
      filename: `${loggerSetting.path}info.log`,
      prepend: false,
      datePattern: "YYYY-MM-DD",
      level: "info",
    }),
    new DailyRotateFile({
      name: "error_logger",
      filename: `${loggerSetting.path}error.log`,
      prepend: false,
      datePattern: "YYYY-MM-DD",
      level: "error",
    }),
  ],
});

module.exports = logger;
