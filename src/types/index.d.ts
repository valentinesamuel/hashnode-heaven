import { Request as ExpressRequest } from 'express';

export type Request = ExpressRequest & {
  requestId?: string;
  correlationId?: string;
};

declare module 'express' {
  interface Request extends ExpressRequest {
    requestId?: string;
    correlationId?: string;
  }
}
declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
    correlationId?: string;
  }
}
