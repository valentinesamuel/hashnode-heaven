import winston, { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
// import TelegramLogger from 'winston-telegram';

const { combine, timestamp, json, errors } = format;

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '5k',
  maxFiles: '6d',
});

fileRotateTransport.on('new', (filename) => {
  console.log(`New log file created: ${filename}`);
});
fileRotateTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`Log file rotated: ${oldFilename} -> ${newFilename}`);
});
fileRotateTransport.on('archive', (zipFilename) => {
  console.log(`Log files archived: ${zipFilename}`);
});
fileRotateTransport.on('logRemoved', (removedFilename) => {
  console.log(`Log file removed: ${removedFilename}`);
});

const logger = createLogger({
  levels: winston.config.npm.levels,
  level: process.env.LOG_LEVEL ?? 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
    json(),
  ),
  transports: [new transports.Console(), fileRotateTransport],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
});

// const errorFilter = winston.format((info, opts) => {
//   return info.level === 'error' ? info : false;
// });

// const infoFilter = winston.format((info, opts) => {
//   return info.level === 'info' ? info : false;
// });

// // Create the logger
// const logger = createLogger({
//   levels: winston.config.syslog.levels,
//   level: process.env.LOG_LEVEL || 'info',
//   format: combine(
//     errors({ stack: true }),
//   timestamp({
//     format: 'YYYY-MM-DD hh:mm:ss.SSS A',
//   }),
//   align(),
//   printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
// ),
// transports: [
//   new transports.Console(),
//   new transports.File({
//     filename: 'logs/combined.log',
//   }),
//   new transports.File({
//     filename: 'logs/error.log',
//     level: 'error',
//     format: combine(errorFilter(), timestamp(), json()),
//   }),
//   new transports.File({
//     filename: 'logs/info.log',
//     level: 'info',
//     format: combine(infoFilter(), timestamp(), json()),
//   }),
// ],
// exceptionHandlers: [
//   new transports.File({ filename: 'logs/exception.log' }),
// ],
// rejectionHandlers: [
//   new transports.File({ filename: 'logs/rejections.log' }),
// ],
// });

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection at:', error);
  process.exitCode = 1;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown=>>>>:', error);
  process.exitCode = 1;
});

export default logger;
