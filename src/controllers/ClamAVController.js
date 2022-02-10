/**
 * The controller defines endpoint to scan a file by ClamAV.
 */

const _ = require("lodash");
const config = require("config");
const fs = require("fs");
const joi = require("joi");
const NodeClam = require("clamscan");
const multer = require("multer");
const logger = require("../common/logger");
const helper = require("../common/helper");
const request = require("superagent");
const util = require("../common/util");

const { originator, mimeType } = require("../../constants").busApiMeta;

// Upload middleware, using a temporary directory instead of the default memory storage
// to make sure the app don't consume much memory when handling large files
const upload = multer({ dest: "uploads/" }).single("file");

let clamscan = null;

const initClamScanner = async () => {
  try {
    clamscan = await new NodeClam().init({
      clamdscan: {
        host: config.CLAMAV_HOST,
        port: config.CLAMAV_PORT,
      },
    });
    const versionInfo = await clamscan.getVersion();
    logger.info(`Initialized ClamAV version ${versionInfo}`);
  } catch (err) {
    logger.debug(`Failed to initialize ClamAV. Error ${err}`);
  }
};

initClamScanner();

/**
 * Scan the uploaded file by ClamAV.
 * @param {Object} req the request
 * @param {Object} res the response
 * @param {Function} next the next middleware
 */
async function scan(req, res, next) {
  upload(req, res, async (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }

    if (!req.file) {
      return next({ status: 400, message: "file is required" });
    }

    // Check if the archive is a zip bomb
    const [isZipBomb, errorCode, errorMessage] = await util.isZipBomb(
      req.file.path
    );

    if (isZipBomb) {
      logger.warn(
        `Scanned file ${req.file.originalname}, path ${req.file.path}: Zip Bomb: ${errorCode}, ${errorMessage} DETECTED`
      );

      fs.unlink(req.file.path, () => {});

      return res.json({
        infected: true,
        malicious: errorMessage,
      });
    }

    // Scan
    const fileStream = fs.createReadStream(req.file.path);

    if (clamscan == null) {
      await initClamScanner();
    }

    try {
      const { isInfected, viruses } = await clamscan.scanStream(fileStream);

      // Delete the file
      fileStream.destroy();
      fs.unlink(req.file.path, () => {});

      // Generate response
      if (isInfected) {
        logger.warn(
          `Scanned file ${req.file.originalname}, path ${req.file.path}: Virus: ${viruses} DETECTED`
        );

        res.json({ infected: isInfected, malicious: viruses.join(",") });
      } else {
        logger.debug(
          `Scanned file ${req.file.originalname}, path ${req.file.path}: OK`
        );

        res.json({ infected: false });
      }
    } catch (scanErr) {
      // Delete the file
      fileStream.destroy();
      fs.unlink(req.file.path, () => {});

      next(scanErr);
    }
  });
}

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
 * Check availability of ClamAV daemon
 *
 * @param {Object} req The request
 * @param {Object} res The response
 */
async function check(req, res) {
  try {
    if (clamscan == null) await initClamScanner();

    const versionInfo = await clamscan.getVersion();

    res.status(200).json({
      checksRun: 1,
      versionInfo,
    });
  } catch (err) {
    res.status(503).json({
      checksRun: 1,
    });
  }
}

module.exports = {
  scan,
  batchScan,
  check,
};
