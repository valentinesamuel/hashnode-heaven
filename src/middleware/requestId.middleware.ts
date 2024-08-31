import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Request } from '../types';

// Middleware to add requestId and correlationId to each request
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = uuidv4();
  const correlationId = uuidv4();

  // Attach the IDs to the request object
  req.requestId = requestId;
  req.correlationId = correlationId;

  // Optionally, you can set these IDs in response headers as well
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Correlation-Id', correlationId);

  next();
}
