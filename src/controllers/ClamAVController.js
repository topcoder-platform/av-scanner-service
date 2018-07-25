/**
 * The controller defines endpoint to scan a file by ClamAV.
 */
const config = require('config')
const fs = require('fs')
const clamav = require('clamav.js')
const multer = require('multer')
const logger = require('../common/logger')

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

module.exports = {
  scan
}
