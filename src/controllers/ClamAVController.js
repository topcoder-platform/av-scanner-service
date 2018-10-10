/**
 * The controller defines endpoint to scan a file by ClamAV.
 */

const _ = require('lodash')
const config = require('config')
const fs = require('fs')
const joi = require('joi')
const clamav = require('clamav.js')
const multer = require('multer')
const logger = require('../common/logger')
const helper = require('../common/helper')
const request = require('superagent')
const { originator, mimeType } = require('../../constants').busApiMeta

// Upload middleware, using a temporary directory instead of the default memory storage
// to make sure the app don't consume much memory when handling large files
const upload = multer({ dest: 'uploads/' }).single('file')

// Initialize ClamAV
const clamavScanner = clamav.createScanner(config.CLAMAV_PORT, config.CLAMAV_HOST)

/**
   * Scan the uploaded file by ClamAV.
   * @param {Object} req the request
   * @param {Object} res the response
   * @param {Function} next the next middleware
   */
function scan (req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      err.status = 400
      return next(err)
    }

    if (!req.file) {
      return next({ status: 400, message: 'file is required' })
    }

    // Scan
    const fileStream = fs.createReadStream(req.file.path)
    clamavScanner.scan(fileStream, (scanErr, object, malicious) => {
      // Delete the file
      fileStream.destroy()
      fs.unlink(req.file.path, () => { })

      if (scanErr) {
        next(scanErr)
      } else if (malicious) {
        logger.debug(`Scanned file ${req.file.originalname}, path ${req.file.path}: ${malicious} FOUND`)
        res.json({ infected: true, malicious })
      } else {
        logger.debug(`Scanned file ${req.file.originalname}, path ${req.file.path}: OK`)
        res.json({ infected: false })
      }
    })
  })
}

/**
   * Process the scan request using events
   * @param {Object} req the request
   * @param {Object} res the response
   * @param {Function} next the next middleware
   */
function batchScan (req, res, next) {
  const schema = joi.object().keys({
    submissionId: joi.string().uuid().required(),
    url: joi.string().uri().trim().required(),
    fileName: joi.string().required()
  }).required()

  const result = joi.validate(req.body, schema)
  if (result.error) {
    result.error.status = 400
    return next(result.error)
  }

  // Request body for Posting to Bus API
  const reqBody = {
    'topic': config.AVSCAN_TOPIC,
    'originator': originator,
    'timestamp': (new Date()).toISOString(),
    'mime-type': mimeType,
    'payload': _.extend({ 'status': 'unscanned' }, req.body)
  }

  helper.getM2Mtoken().then((token) => {
    request
      .post(config.BUSAPI_EVENTS_URL)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(reqBody)
      .then(result => {
        res.status(result.statusCode).json({})
      })
      .catch(err => {
        return next(err)
      })
  })
}

/**
 * Check availability of ClamAV daemon
 * @param {Object} req The request
 * @param {Object} res The response
 */
function check (req, res) {
  clamav.ping(config.CLAMAV_PORT, config.CLAMAV_HOST, 2000, err => {
    if (err) {
      logger.error(err)
      res.status(503).json({
        checksRun: 1
      })
    } else {
      res.status(200).json({
        checksRun: 1
      })
    }
  })
}

module.exports = {
  scan,
  batchScan,
  check
}
