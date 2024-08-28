// logger/logger.ts

import { createLogger, transports, Logger, LogEntry } from 'winston';
import { jsonFormat, humanReadableFormat } from './format';
import { getCallerInfo } from './util';
import { readFileSync } from 'fs';
import * as path from 'path';
import 'winston-daily-rotate-file';
import TelegramLogger, { FormatOptions } from 'winston-telegram';
import dotenv from 'dotenv';
dotenv.config();

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
    const { fileName, functionName, lineNumber, filePath } = getCallerInfo();
    const logger = createLogger({
      level: 'info',
      format: format === 'json' ? jsonFormat : humanReadableFormat,
      transports: [new transports.Console(), fileRotateTransport],
    });
    logger.add(
      new TelegramLogger({
        token: process.env.TELEGRAM_BOT_TOKEN!,
        chatId: parseInt(process.env.TELEGRAM_CHAT_ID!),
        level: level,
        handleExceptions: true,
        parseMode: 'HTML',
        formatMessage: (_params: FormatOptions, info: LogEntry) => {
          const levelColor =
            {
              error: '🔴',
              warn: '🟠',
              info: '🟢',
              debug: '🔵',
            }[info.level] ?? '⚪';

          return `
${levelColor}${levelColor}${levelColor}${levelColor}${levelColor} 
<b>Level:</b> <code>${info.level}</code>
<b>Request ID:</b> <code>${info.requestId}</code>
<b>Message:</b> <code>${info.message}</code>
<b>FileName:</b> <code>${info.fileName}</code>
<b>FilePath:</b> <code>${info.filePath}</code>
<b>Function:</b> <code>${info.functionName}</code>
<b>Line:</b> <code>${info.lineNumber}</code>
<b>Build Version:</b> <code>${info.buildVersion}</code>
<b>Git Commit Hash:</b> <code>${info.gitCommitHash}</code>
<pre>${JSON.stringify(info, null, 2)}</pre>
  `;
        },
      }),
    );

    const logObject: Record<string, unknown> = {
      level,
      message,
      fileName,
      functionName,
      filePath,
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
