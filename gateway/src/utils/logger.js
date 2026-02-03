import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
  })
);

// JSON format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports = [];

// Console transport (always enabled except in test)
if (!isTest) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: isDevelopment ? 'debug' : 'info',
    })
  );
}

// File transports (only in production)
if (!isDevelopment && !isTest) {
  // Error log - rotating daily, keep for 14 days
  transports.push(
    new DailyRotateFile({
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      maxSize: '20m',
      format: fileFormat,
    })
  );

  // Combined log - rotating daily, keep for 7 days
  transports.push(
    new DailyRotateFile({
      filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      maxSize: '20m',
      format: fileFormat,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: fileFormat,
  defaultMeta: { service: 'hagen-logistics-gateway' },
  transports,
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

/**
 * Request logger middleware for Express
 * Logs HTTP requests with relevant details
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
}

/**
 * Helper methods for common logging patterns
 */
export const log = {
  // Standard levels
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  // Domain-specific helpers
  auth: (message, meta = {}) => logger.info(`[Auth] ${message}`, meta),
  api: (message, meta = {}) => logger.info(`[API] ${message}`, meta),
  db: (message, meta = {}) => logger.debug(`[DB] ${message}`, meta),
  optimize: (message, meta = {}) => logger.info(`[Optimize] ${message}`, meta),

  // Security events
  security: (message, meta = {}) => logger.warn(`[SECURITY] ${message}`, {
    ...meta,
    timestamp: new Date().toISOString(),
  }),
};

export default logger;
