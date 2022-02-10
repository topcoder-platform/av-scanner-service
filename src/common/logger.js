/**
 * Configure the logger.
 */
const config = require("config");
const { createLogger, format, transports } = require("winston");

// Initialize the logger
const logger = createLogger({
  level: config.LOG_LEVEL,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

module.exports = logger;
