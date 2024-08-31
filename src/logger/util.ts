import * as path from 'path';

export function getCallerInfo() {
  const originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack as unknown as NodeJS.CallSite[];
  Error.prepareStackTrace = originalPrepareStackTrace;

  if (stack.length < 4) {
    return {
      fileName: 'unknown',
      filePath: 'unknown',
      functionName: 'unknown',
      lineNumber: 'unknown',
    };
  }

  const caller = stack[3] as unknown as NodeJS.CallSite;
  const fullPath = caller.getFileName() as string;
  const fileName = path.basename(fullPath);
  const filePath = path.relative(process.cwd(), fullPath);
  const functionName = caller.getFunctionName() ?? 'anonymous';
  const lineNumber = caller.getLineNumber();

  return { fileName, filePath, functionName, lineNumber };
}
