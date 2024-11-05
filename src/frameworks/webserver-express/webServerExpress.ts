import compression from 'compression';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { Request, Response, Express, NextFunction } from 'express';
import express from 'express';
import { WebserverConfig } from '../../config/config';
import ILogger from '../../logger/logger';
import errorHandlingMiddleware from './middlewares/errorHandlingMiddleware';

export default class WebServerExpress {
  private eapp: Express;

  constructor(private config: WebserverConfig, private logger: ILogger) {
    this.eapp = express();
    this.configure();
  }

  get app() {
    return this.eapp;
  }

  /**
   * -------------------------------------------------------
   * Configures the express app with middleware and settings
   */
  private configure(): void {
    const app = this.app;

    app.use(helmet());
    app.use(compression());
    app.use(bodyParser.json({ limit: this.config.jsonLimit }));
    app.use(
      bodyParser.urlencoded({
        limit: this.config.urlencodedLimit,
        extended: true,
        parameterLimit: 50000,
      }),
    );

    app.use((_: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      );

      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With, Content-type, Authorization, Cache-control, Pragma',
      );

      next();
    });
    this.app.use(errorHandlingMiddleware);
  }

  /**
   * -------------------------------------------------------
   * Starts the express app
   */
  public async start(): Promise<void> {
    this.app.use(errorHandlingMiddleware);

    await this.app.listen(this.config.port, () => {
      this.logger.info(`Server is running on port ${this.config.port}`);
    });
  }
}
