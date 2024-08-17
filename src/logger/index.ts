import { createLogger, format, transports } from 'winston';

// Define custom log format
const customFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
);

// Create the logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), customFormat),
    }),
    // new transports.File({
    //   filename: 'logs/combined.log',
    //   format: customFormat,
    // }),
    // new transports.File({
    //   filename: 'logs/error.log',
    //   level: 'error',
    //   format: customFormat,
    // }),
  ],
});

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection at:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
});

export default logger;
