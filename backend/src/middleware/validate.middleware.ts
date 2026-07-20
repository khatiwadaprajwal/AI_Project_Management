import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validate = <T extends { body?: any; query?: any; params?: any }>(
  schema: ZodType<T>
) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsedData.body) req.body = parsedData.body;
      if (parsedData.query) req.query = parsedData.query;
      if (parsedData.params) req.params = parsedData.params;

      next();
    } catch (error) {
      next(error);
    }
  };