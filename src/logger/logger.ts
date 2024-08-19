// logger/logger.ts

import { createLogger, transports, Logger, LogEntry } from 'winston';
import { jsonFormat, humanReadableFormat } from './format';
import { getCallerInfo } from './util';

class ContextLogger {
  private logger: Logger;

  constructor(defaultFormat: 'json' | 'human' = 'json') {
    this.logger = createLogger({
      level: 'info',
      format: defaultFormat === 'json' ? jsonFormat : humanReadableFormat,
      transports: [new transports.Console()],
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
      transports: [new transports.Console()],
    });

    const logObject: Record<string, unknown> = {
      level,
      message,
      fileName,
      functionName,
      lineNumber,
      ...metadata, // Merge in additional metadata
    };

    if (level === 'error' && error instanceof Error) {
      logObject.message = error.message;
      logObject.stack = error.stack; // Include the full error stack trace
    }

    logger.log(logObject as LogEntry);
  }

  error(
    message: string,
    error: Error | null = null,
    format: 'json' | 'human' = 'json',
    metadata: Record<string, unknown> = {},
  ) {
    this.log('error', message, error, format, metadata);
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

  // Utility function to generate unique IDs
  static generateUniqueId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

const contextLogger = new ContextLogger();

export default contextLogger;
