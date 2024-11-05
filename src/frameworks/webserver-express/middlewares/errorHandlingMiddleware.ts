import { Request, Response, NextFunction } from 'express';
import HttpException from '../../../errors/httpException';

export default function errorHandlingMiddleware(
  err: unknown,
  _: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);
  console.log('----------------------');
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpException) {
    res.status(err.code).json({ message: err.message });
    return;
  } else if (err instanceof Error) {
    res.status(500).json({ message: 'Internal server error' });
    return;
  } else {
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}
