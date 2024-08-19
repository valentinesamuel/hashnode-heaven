import * as path from 'path';

export function getCallerInfo() {
  const originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack as unknown as NodeJS.CallSite[];
  Error.prepareStackTrace = originalPrepareStackTrace;

  if (stack.length < 4) {
    return {
      fileName: 'unknown',
      functionName: 'unknown',
      lineNumber: 'unknown',
    };
  }

  const caller = stack[3] as unknown as NodeJS.CallSite;
  const fileName = path.basename(caller.getFileName() as string);
  const functionName = caller.getFunctionName() ?? 'anonymous';
  const lineNumber = caller.getLineNumber();

  return { fileName, functionName, lineNumber };
}
