// logger/logger.ts

import { createLogger, transports, Logger, LogEntry } from 'winston';
import { jsonFormat, humanReadableFormat } from './format';
import { getCallerInfo } from './util';
import { readFileSync } from 'fs';
import * as path from 'path';
import 'winston-daily-rotate-file';

const fileRotateTransport = new transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '5k',
  maxFiles: '6d',
});

fileRotateTransport.on('new', async (filename) => {
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

const versionFilePath = path.join(
  __dirname,
  '../',
  '../',
  'scripts',
  'version.json',
);
const versionInfo = JSON.parse(readFileSync(versionFilePath, 'utf-8'));

const buildVersion = versionInfo.buildVersion || 'unknown';
const gitCommitHash = versionInfo.gitCommitHash || 'unknown';

class ContextLogger {
  private logger: Logger;

  constructor(defaultFormat: 'json' | 'human' = 'json') {
    this.logger = createLogger({
      level: 'info',
      format: defaultFormat === 'json' ? jsonFormat : humanReadableFormat,
      transports: [new transports.Console(), fileRotateTransport],
      exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }),
      ],
      rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' }),
      ],
    });
  }

  private log(
    level: string,
    message: string,
    error: Error | null = null,
    format: 'json' | 'human' = 'json',
    metadata: Record<string, unknown> = {},
  ) {
    const { fileName, functionName, lineNumber } = getCallerInfo();
    const logger = createLogger({
      level: 'info',
      format: format === 'json' ? jsonFormat : humanReadableFormat,
      transports: [new transports.Console(), fileRotateTransport],
    });

    const logObject: Record<string, unknown> = {
      level,
      message,
      fileName,
      functionName,
      lineNumber,
      buildVersion,
      gitCommitHash,
      ...metadata, // Merge in additional metadata
    };

    if (level === 'error' && error instanceof Error) {
      logObject.message = error.message;
      logObject.stack = error.stack; 
    }

    logger.log(logObject as LogEntry);
  }

  error(
    message: string,
    error: Error | null = null,
    format: 'json' | 'human' = 'json',
    metadata: Record<string, unknown> = {},
  ) {
    setTimeout(() => {
      this.log('error', message, error, format, metadata);
    }, 250);
  }

  warn(
    message: string,
    format: 'json' | 'human' = 'json',
    metadata: Record<string, unknown> = {},
  ) {
    this.log('warn', message, null, format, metadata);
  }

  info(
    message: string,
    format: 'json' | 'human' = 'json',
    metadata: Record<string, unknown> = {},
  ) {
    this.log('info', message, null, format, metadata);
  }

  debug(
    message: string,
    format: 'json' | 'human' = 'json',
    metadata: Record<string, unknown> = {},
  ) {
    this.log('debug', message, null, format, metadata);
  }

  static generateUniqueId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

const contextLogger = new ContextLogger();

export default contextLogger;
