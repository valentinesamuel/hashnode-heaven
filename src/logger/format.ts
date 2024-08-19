import { format } from 'winston';

// Format for JSON output
export const jsonFormat = format.combine(format.timestamp(), format.json());

// Format for human-readable output
export const humanReadableFormat = format.combine(
  format.timestamp(),
  format.printf(
    ({
      level,
      message,
      timestamp,
      fileName,
      functionName,
      lineNumber,
      stack,
      ...metadata
    }) => {
      let logMessage = `[${timestamp}] [${fileName}:${lineNumber}] [${functionName}] ${level}: ${message}`;

      if (level === 'error' && stack) {
        logMessage += `\nStack Trace:\n${stack}`;
      }

      // Include metadata in human-readable format
      if (Object.keys(metadata).length > 0) {
        logMessage += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
      }

      return logMessage;
    },
  ),
);
