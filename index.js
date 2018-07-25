/**
 * Initialize and start the express application.
 */
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

const express = require('express')
const cors = require('cors')
const config = require('config')
const morgan = require('morgan')
const logger = require('./src/common/logger')
const ClamAVControler = require('./src/controllers/ClamAVController')

// Create app
const app = express()
app.use(cors())

// Request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('common', { skip: (req, res) => res.statusCode < 400 }))
} else {
  app.use(morgan('dev'))
}

// Configure the routes
app.post(`${config.CONTEXT_PATH}/scan`, ClamAVControler.scan)

// Error handler
app.use((err, req, res, next) => {
  let status = err.status || 500
  let message = err.message
  if (status === 500) {
    message = 'Internal server error'
  }
  res.status(status).send({ message })
  logger.error(err)
})

// Start
app.listen(config.PORT, '0.0.0.0')
logger.info(`Express server listening on port ${config.PORT} in ${process.env.NODE_ENV} mode`)

// Export for testing
module.exports = app
