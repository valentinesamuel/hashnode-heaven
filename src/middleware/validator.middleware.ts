import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassConstructor<T> = new (...args: any[]) => T;

function validateRequest<T extends object>(type: ClassConstructor<T>) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const dtoObj = plainToInstance(type, req.body);
    const errors = await validate(dtoObj, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({
        status: 'error',
        errors: formattedErrors,
      });
      return;
    }

    req.body = dtoObj;
    next();
  };
}

function formatErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    if (error.constraints) {
      return Object.values(error.constraints);
    }
    if (error.children && error.children.length > 0) {
      return formatErrors(error.children);
    }
    return ['Validation failed'];
  });
}

export default validateRequest;
