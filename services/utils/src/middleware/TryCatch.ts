import { Request, Response, RequestHandler, NextFunction } from "express";

const TryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (err: any) {
      next(err); // delegate to Express error handler, don't send directly
    }
  };
};

export default TryCatch;