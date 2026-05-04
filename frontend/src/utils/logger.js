/**
 * Logger utility for consistent logging across the frontend
 * Includes console logs with timestamps and severity levels
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
}

const LOG_COLORS = {
  DEBUG: '#888888',
  INFO: '#0066cc',
  WARN: '#ff9900',
  ERROR: '#cc0000',
}

const formatTime = () => {
  const now = new Date()
  return now.toISOString().split('T')[1].split('Z')[0]
}

const log = (level, message, data = null) => {
  const timestamp = formatTime()
  const prefix = `[${timestamp}] [${level}]`
  const style = `color: ${LOG_COLORS[level]}; font-weight: bold;`

  if (data) {
    console.log(`%c${prefix}`, style, message, data)
  } else {
    console.log(`%c${prefix}`, style, message)
  }
}

export const logger = {
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),

  // Specific helpers for common operations
  apiCall: (method, url, status = null) => {
    const msg = status ? `${method} ${url} → ${status}` : `${method} ${url}`
    return log(LOG_LEVELS.INFO, `API: ${msg}`)
  },

  auth: (action, result) => log(LOG_LEVELS.INFO, `AUTH: ${action}`, result),

  imageUpload: (fileName, size) => {
    log(LOG_LEVELS.INFO, `IMAGE: Uploaded "${fileName}" (${(size / 1024 / 1024).toFixed(2)}MB)`)
  },

  detection: (disease, confidence) => {
    log(LOG_LEVELS.INFO, `DETECTION: ${disease} (${confidence}% confidence)`)
  },

  stateChange: (component, stateName, value) => {
    log(LOG_LEVELS.DEBUG, `${component} state changed: ${stateName}`, value)
  },

  error: (component, action, error) => {
    const errorData = {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      timestamp: new Date().toISOString(),
    }
    log(LOG_LEVELS.ERROR, `${component} | ${action}`, errorData)
  },
}

export default logger
