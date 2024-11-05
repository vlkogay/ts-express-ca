import { Request, Response, NextFunction } from 'express';
import ICacheRepository from '../../../application/repositories/cacheRepository';
import ILogger from '../../../logger/logger';
type MiddlewareCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;
export default function CachingMiddleware(
  cacheRepository: ICacheRepository,
  key: string,
  logger: ILogger,
  name?: string,
): MiddlewareCallback {
  const paramName = name || 'id';

  return async function (req: Request, res: Response, next: NextFunction) {
    const id = req.params[paramName] || '';
    try {
      const data = await cacheRepository.get(`${key}_${id}`);
      if (data) {
        return res.json(JSON.parse(data));
      }
    } catch (err) {
      logger.error(err);
    }
    return next();
  };
}
