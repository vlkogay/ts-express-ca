import request from 'supertest';
import { Express, Request, Response } from 'express';

import { WebserverConfig } from '../../config/config';
import WebServerExpress from './webServerExpress';
import { IncomingMessage, Server, ServerResponse } from 'http';
import ILogger from '../../logger/logger';

const mockLogger: ILogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

describe('WebServerExpress', () => {
  let app: Express;
  let server: WebServerExpress;
  const config: WebserverConfig = {
    port: 3000,
    jsonLimit: '1mb',
    urlencodedLimit: '1mb',
  };

  beforeAll(() => {
    server = new WebServerExpress(config, mockLogger);
    app = server.app;
  });

  it('should configure the express app with helmet', () => {
    const helmetMiddleware = app._router.stack.find(
      (layer: { name: string }) => {
        return layer.name === 'helmetMiddleware';
      },
    );
    expect(helmetMiddleware).toBeDefined();
  });

  it('should configure the express app with compression', () => {
    const compressionMiddleware = app._router.stack.find(
      (layer: { name: string }) => layer.name === 'compression',
    );
    expect(compressionMiddleware).toBeDefined();
  });

  it('should configure the express app with bodyParser.json', () => {
    const jsonMiddleware = app._router.stack.find(
      (layer: { name: string }) => layer.name === 'jsonParser',
    );
    expect(jsonMiddleware).toBeDefined();
  });

  it('should configure the express app with bodyParser.urlencoded', () => {
    const urlencodedMiddleware = app._router.stack.find(
      (layer: { name: string }) => layer.name === 'urlencodedParser',
    );
    expect(urlencodedMiddleware).toBeDefined();
  });

  it('should set Access-Control-Allow-Methods header', async () => {
    app.get('/test', (_: Request, res: Response) => {
      res.send('test');
    });
    const response = await request(app).get('/test');
    expect(response.headers['access-control-allow-methods']).toBe(
      'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );
  });

  it('should set Access-Control-Allow-Headers header', async () => {
    app.get('/test', (_: Request, res: Response) => {
      res.send('test');
    });
    const response = await request(app).get('/test');
    expect(response.headers['access-control-allow-headers']).toBe(
      'X-Requested-With, Content-type, Authorization, Cache-control, Pragma',
    );
  });

  it('should start the server and listen on the specified port', () => {
    const listenSpy = jest
      .spyOn(app, 'listen')
      .mockImplementation(
        (
          _,
          callback,
        ): Server<typeof IncomingMessage, typeof ServerResponse> => {
          if (callback) {
            callback();
          }
          return {} as Server<typeof IncomingMessage, typeof ServerResponse>;
        },
      );
    server.start();
    expect(listenSpy).toHaveBeenCalledWith(config.port, expect.any(Function));
  });
});
