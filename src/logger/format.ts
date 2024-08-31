// logger/formats.ts

import { format } from 'winston';

// Format for JSON output
export const jsonFormat = format.combine(
  format.timestamp(),
  format.json({
    // Adding build version and git commit hash explicitly is not needed since they're already in the log object
  }),
);

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
      buildVersion,
      gitCommitHash,
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

      // Include build version and git commit hash in human-readable format
      // logMessage += `\nBuild Version: ${buildVersion}\nGit Commit Hash: ${gitCommitHash}`;

      return logMessage;
    },
  ),
);
