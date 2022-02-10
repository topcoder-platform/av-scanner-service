/**
 * Initialize and start the express application.
 */
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

const cors = require("cors");
const config = require("config");
const express = require("express");
const morgan = require("morgan");
const logger = require("./src/common/logger");
const ClamAVController = require("./src/controllers/ClamAVController");

// Create app
const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Request logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("common", { skip: (req, res) => res.statusCode < 400 }));
} else {
  app.use(morgan("dev"));
}

// Configure the routes
app.post(`${config.CONTEXT_PATH}/scan`, ClamAVController.scan);
app.post(`${config.CONTEXT_PATH}/batchScan`, ClamAVController.batchScan);
app.get(`${config.CONTEXT_PATH}/health`, ClamAVController.check);

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  let message = err.message;
  // Fetch actual error message from details for JOI errors
  if (err.isJoi) {
    message = err.details[0].message;
  }
  if (status === 500) {
    message = "Internal server error";
  }
  res.status(status).send({ message });
  logger.error(err);
});

// Start
app.listen(config.PORT, "0.0.0.0");
logger.info(
  `Express server listening on port ${config.PORT} in ${process.env.NODE_ENV} mode`
);

// Export for testing
module.exports = app;
