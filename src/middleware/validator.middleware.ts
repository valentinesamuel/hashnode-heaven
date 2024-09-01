import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

type ZodErrorMessage = {
  code?: string;
  path?: string[];
  message?: string;
  keys?: string[];
  expected?: string;
  received?: string;
};

const validateRequest =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => {
          const { code, path } = err as ZodErrorMessage;

          if (code === 'unrecognized_keys') {
            const unrecognizedKeys =
              (err as ZodErrorMessage).keys?.join(', ') ?? '';
            return `Unrecognized key(s) in: [ ${unrecognizedKeys} ]`;
          }

          const { expected, received } = err as {
            expected: string;
            received: string;
          };

          return `Expected ${expected} but got ${received} on ${path?.join('.')}`;
        });

        return res.status(400).json({
          status: 'error',
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };

export default validateRequest;
