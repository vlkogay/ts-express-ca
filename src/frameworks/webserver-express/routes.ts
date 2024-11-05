import HttpException from '../../errors/httpException';
import ILogger from '../../logger/logger';
import { Express, Request, Response, NextFunction } from 'express';

type ControllerCallback = (req: Request, res: Response) => Promise<void>;
export type MiddlewareCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

function ProcessControllerCallback(callback: ControllerCallback) {
  return async (req: Request, res: Response) => {
    try {
      await callback(req, res);
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.code).send({ error: error.message });
      } else res.status(500).send({ error: 'An error occurred' });
    }
  };
}

export default class Routes {
  protected logger: ILogger;
  protected app: Express;
  constructor(app: Express, logger: ILogger) {
    this.app = app;
    this.logger = logger;
  }

  get(
    route: string,
    callback: ControllerCallback,
    middleware?: Array<MiddlewareCallback> | MiddlewareCallback,
  ): void {
    this.app.get(route, middleware || [], ProcessControllerCallback(callback));
  }

  post(
    route: string,
    callback: ControllerCallback,
    middleware?: Array<MiddlewareCallback> | MiddlewareCallback,
  ): void {
    this.app.post(route, middleware || [], ProcessControllerCallback(callback));
  }

  delete(
    route: string,
    callback: ControllerCallback,
    middleware?: Array<MiddlewareCallback> | MiddlewareCallback,
  ): void {
    this.app.delete(
      route,
      middleware || [],
      ProcessControllerCallback(callback),
    );
  }

  patch(
    route: string,
    callback: ControllerCallback,
    middleware?: Array<MiddlewareCallback> | MiddlewareCallback,
  ): void {
    this.app.patch(
      route,
      middleware || [],
      ProcessControllerCallback(callback),
    );
  }

  put(
    route: string,
    callback: ControllerCallback,
    middleware?: Array<MiddlewareCallback> | MiddlewareCallback,
  ): void {
    this.app.put(route, middleware || [], ProcessControllerCallback(callback));
  }
}
