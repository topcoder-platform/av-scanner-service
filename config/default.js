/**
 * The default configuration.
 */
module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  CONTEXT_PATH: process.env.CONTEXT_PATH || '/v5',
  PORT: process.env.PORT || 3000,
  CLAMAV_HOST: process.env.CLAMAV_HOST || 'localhost',
  CLAMAV_PORT: process.env.CLAMAV_PORT || 3310,
  AVSCAN_TOPIC: process.env.AVSCAN_TOPIC || 'avscan.action.scan',
  BUSAPI_EVENTS_URL: process.env.BUSAPI_EVENTS_URL || 'https://api.topcoder-dev.com/v5/bus/events',
  AUTH0_URL: process.env.AUTH0_URL, // Auth0 credentials for AV Scanner Service
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://www.topcoder.com',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL
}
