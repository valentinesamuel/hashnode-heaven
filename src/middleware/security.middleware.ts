import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

export const helmetMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  helmet()(req, res, () => {
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'trusted-cdn.com'],
        styleSrc: ["'self'", 'trusted-cdn.com'],
        imgSrc: ["'self'", 'trusted-cdn.com'],
        connectSrc: ["'self'", 'api.trusted.com'],
        frameSrc: ["'self'", 'trusted-iframe.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    })(req, res, () => {
      helmet.hsts({
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      })(req, res, () => {
        helmet.noSniff()(req, res, () => {
          helmet.frameguard({ action: 'deny' })(req, res, () => {
            helmet.xssFilter()(req, res, () => {
              helmet.referrerPolicy({ policy: 'no-referrer' })(req, res, () => {
                helmet.dnsPrefetchControl({ allow: false })(req, res, () => {
                  helmet.permittedCrossDomainPolicies({
                    permittedPolicies: 'none',
                  })(req, res, next);
                });
              });
            });
          });
        });
      });
    });
  });
};
