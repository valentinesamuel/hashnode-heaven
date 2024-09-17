// import { readFileSync } from 'fs';
// import * as path from 'path';
// import winston, { createLogger, format, transports } from 'winston';
// import 'winston-daily-rotate-file';

// const { combine, timestamp, json, errors } = format;

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
// });}

// const logger = createLogger({
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
