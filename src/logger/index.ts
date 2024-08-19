// import { readFileSync } from 'fs';
// import * as path from 'path';
// import winston, { createLogger, format, transports } from 'winston';
// import 'winston-daily-rotate-file';

// const { combine, timestamp, json, errors } = format;
// const versionFilePath = path.join(
//   __dirname,
//   '../',
//   '../',
//   'scripts',
//   'version.json',
// );
// const versionInfo = JSON.parse(readFileSync(versionFilePath, 'utf-8'));

// const buildVersion = versionInfo.buildVersion || 'unknown';
// const gitCommitHash = versionInfo.gitCommitHash || 'unknown';

// const fileRotateTransport = new winston.transports.DailyRotateFile({
//   filename: 'logs/combined-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   maxSize: '5k',
//   maxFiles: '6d',
// });

// fileRotateTransport.on('new', async (filename) => {
//   console.log(`New log file created: ${filename}`);
// });
// fileRotateTransport.on('rotate', (oldFilename, newFilename) => {
//   console.log(`Log file rotated: ${oldFilename} -> ${newFilename}`);
// });
// fileRotateTransport.on('archive', (zipFilename) => {
//   console.log(`Log files archived: ${zipFilename}`);
// });
// fileRotateTransport.on('logRemoved', (removedFilename) => {
//   console.log(`Log file removed: ${removedFilename}`);
// });

// function getCallerFile() {
//   const originalPrepareStackTrace = Error.prepareStackTrace;
//   Error.prepareStackTrace = (_, stack) => stack;
//   const stack = new Error().stack;
//   Error.prepareStackTrace = originalPrepareStackTrace;

//   // Skip the first two frames (this function and the log call)
//   const callerFile =
//     stack && stack[2] && (stack[2] as unknown as NodeJS.CallSite).getFileName();
//   return path.basename(callerFile as string);
// }

// const logger = createLogger({
//   defaultMeta: {
//     buildVersion,
//     gitCommitHash,
//   },
//   levels: winston.config.npm.levels,
//   level: process.env.LOG_LEVEL ?? 'info',
//   format: format.combine(
//     format.timestamp(),
//     format.printf(({ level, message, timestamp, fileName }) => {
//       return `[${timestamp}] [${fileName}] ${level}: ${message}`;
//     }),
//   ),
//   transports: [new transports.Console(), fileRotateTransport],
//   exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
//   rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
// });

// export function logWithFileContext(level: string, message: string) {
//   const fileName = getCallerFile();
//   logger.log({ level, message, fileName });
// }

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

// export default logger;
