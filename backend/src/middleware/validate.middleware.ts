import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsedData.body;


      if (parsedData.query) {
        Object.defineProperty(req, 'query', {
          value: parsedData.query,
          writable: true,
          configurable: true,
        });
      }

      if (parsedData.params) {
        Object.defineProperty(req, 'params', {
          value: parsedData.params,
          writable: true,
          configurable: true,
        });
      }

      return next();
    } catch (error) {
      next(error);
    }
  };