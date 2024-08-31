import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const requestLoggerFormat = winston.format.printf(
  ({ timestamp, level, message }) => {
    let emoji = '';

    if (level === 'error') {
      emoji = '⛔';
    } else if (level === 'warn') {
      emoji = '⚠️ ';
    } else if (level === 'info') {
      emoji = '✅';
    }

    return `[${timestamp}] ${level} ${emoji} ${message}`;
  },
);

const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    requestLoggerFormat,
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/requests.log' }),
  ],
});

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedTimeInMs.toFixed(3)}ms`;

    if (res.statusCode >= 500) {
      requestLogger.error(logMessage);
    } else if (res.statusCode >= 400) {
      requestLogger.warn(logMessage);
    } else {
      requestLogger.info(logMessage);
    }
  });

  next();
};

export default logRequest;
