import { Request, Response, NextFunction } from 'express';
import { HttpErrorCodes } from '../../../errors/httpException';
import ILogger from '../../../logger/logger';
import IAuthTokenService from '../../../application/services/auth/authTokenService';

type MiddlewareOptions = {
  admin?: boolean;
};

function ResponseError(res: Response, code: number, message: string) {
  res.status(code).send({ error: message });
}

export default function authMiddleware(
  authService: IAuthTokenService,
  logger: ILogger,
  options: MiddlewareOptions,
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    // Get token from header
    const authorization = req.header('Authorization');

    if (!authorization) {
      ResponseError(res, HttpErrorCodes.UNAUTHORIZED, 'No access token found');

      return;
    }
    if (authorization.split(' ')[0] !== 'Bearer') {
      ResponseError(
        res,
        HttpErrorCodes.UNAUTHORIZED,
        'Invalid access token format',
      );

      return;
    }
    const token = authorization.split(' ')[1];
    if (!token) {
      ResponseError(
        res,
        HttpErrorCodes.UNAUTHORIZED,
        'Invalid access token format',
      );

      return;
    }
    try {
      const tokenPayload = await authService.verify(token);

      if (options.admin && tokenPayload.role !== 'admin') {
        ResponseError(
          res,
          HttpErrorCodes.FORBIDDEN,
          'You do not have permission to access this resource',
        );

        return;
      }
      req.user = tokenPayload.user;
      next();
    } catch (error: unknown) {
      logger.error(error);
      ResponseError(res, HttpErrorCodes.UNAUTHORIZED, 'Token is not valid');
    }
  };
}
