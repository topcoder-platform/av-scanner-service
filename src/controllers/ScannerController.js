/**
 * The controller defines endpoint to scan a file by ClamAV.
 */

const _ = require("lodash");
const config = require("config");
const joi = require("joi");
const logger = require("../common/logger");
const helper = require("../common/helper");
const request = require("superagent");

const { originator, mimeType } = require("../../constants").busApiMeta;

/**
 * Process the scan request using events
 * @param {Object} req the request
 * @param {Object} res the response
 * @param {Function} next the next middleware
 */
function batchScan(req, res, next) {
  logger.debug("ClamAVController->batchScan(): start");
  const schema = joi
    .object()
    .keys({
      submissionId: joi.string().uuid().required(),
      url: joi.string().uri().trim().required(),
      fileName: joi.string().required(),
    })
    .required();

  logger.debug("ClamAVController->batchScan(): validating body");
  const result = joi.validate(req.body, schema);
  if (result.error) {
    logger.error(
      `ClamAVController->batchScan(): validationg error ${result.error}`
    );
    result.error.status = 400;
    return next(result.error);
  }

  // Request body for Posting to Bus API
  logger.debug("ClamAVController->batchScan(): building unscanned event");
  const reqBody = {
    topic: config.AVSCAN_TOPIC,
    originator: originator,
    timestamp: new Date().toISOString(),
    "mime-type": mimeType,
    payload: _.extend({ status: "unscanned" }, req.body),
  };

  logger.debug(
    `ClamAVController->batchScan(): posting unscanned event to the event bus: ${JSON.stringify(
      reqBody
    )}`
  );
  helper.getM2Mtoken().then((token) => {
    request
      .post(config.BUSAPI_EVENTS_URL)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(reqBody)
      .then((result) => {
        res.status(result.statusCode).json({});
        logger.debug("ClamAVController->batchScan(): completed");
      })
      .catch((err) => {
        logger.error(`ClamAVController->batchScan(): validationg error ${err}`);
        return next(err);
      });
  });
}

/**
 * Check if Api is up and running
 *
 * @param {Object} req The request
 * @param {Object} res The response
 */
async function check(req, res) {
  res.status(200).json({
    checksRun: 1,
  });
}

module.exports = {
  batchScan,
  check,
};
