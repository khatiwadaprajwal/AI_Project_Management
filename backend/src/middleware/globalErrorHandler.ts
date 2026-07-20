import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message || 'Internal Server Error';
  let errorData = null;

 
  if (err instanceof ZodError) {
    statusCode = 400;
    status = 'fail';
    message = 'Validation Error';
    errorData = err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
  }

  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    status = 'fail';
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    status = 'fail';
    message = 'Your token has expired. Please log in again.';
  }


  if (err.code === 'P2002') {
    statusCode = 409;
    status = 'fail';
    message = 'Duplicate field value entered. Record already exists.';
  }


  if (env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      status,
      message,
      errors: errorData,
      stack: err.stack,
      error: err,
    });
  }


  return res.status(statusCode).json({
    success: false,
    status,
    message: err.isOperational || err instanceof ZodError ? message : 'Something went wrong!',
    errors: errorData,
  });
};