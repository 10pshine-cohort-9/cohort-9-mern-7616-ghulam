import type { Request, Response, NextFunction } from 'express';
import { type ZodType, ZodError } from 'zod';

import { ValidationError } from '../utils/AppError';

export const validate = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const errors = zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      throw new ValidationError('Validation failed', errors);
    }

    req.body = result.data;
    next();
  };
};
