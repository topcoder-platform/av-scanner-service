/**
 * The test configuration.
 */
module.exports = {
  LOG_LEVEL: 'debug',
  CONTEXT_PATH: '',
  PORT: 3001,
  CLAMAV_HOST: process.env.CLAMAV_HOST || 'localhost',
  CLAMAV_PORT: process.env.CLAMAV_PORT || 3310
}
