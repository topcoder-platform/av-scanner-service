/**
 * The default configuration.
 */
module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  CONTEXT_PATH: process.env.CONTEXT_PATH || '/api/v1',
  PORT: process.env.PORT || 3000,
  CLAMAV_HOST: process.env.CLAMAV_HOST || 'localhost',
  CLAMAV_PORT: process.env.CLAMAV_PORT || 3310
}
