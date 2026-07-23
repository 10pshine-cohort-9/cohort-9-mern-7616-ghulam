import type { Request, Response, NextFunction } from 'express';

import { AppError, ValidationError } from '../utils/AppError';
import { logger } from '../config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logger.error(
    {
      err,
      method: req.method,
      url: req.url,
      body: req.body,
    },
    'Error occurred'
  );

  // Handle known operational errors
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      success: false,
      message: err.message,
    };

    // Include validation errors if present
    if (err instanceof ValidationError && err.errors.length > 0) {
      response.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Mongoose duplicate key error
  if ((err as unknown as Record<string, unknown>).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A resource with that value already exists',
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
