import request from 'supertest';
import express from 'express';
import authMiddleware from './authMiddleware';
import { HttpErrorCodes } from '../../../errors/httpException';
import { Request, Response, Express } from 'express';

const mockAuthService = {
  verify: jest.fn(),
  sign: jest.fn(),
};

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

describe('authMiddleware', () => {
  let app: Express;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupApp = (admin: boolean) => {
    app = express();
    app.use(express.json());
    app.use(authMiddleware(mockAuthService, mockLogger, { admin: admin }));
    app.get('/test', (_: Request, res: Response) => {
      res.status(200).send('Success');
    });
  };

  it('should return 401 if no authorization header is present', async () => {
    setupApp(false);
    const response = await request(app).get('/test');
    expect(response.status).toBe(HttpErrorCodes.UNAUTHORIZED);
    expect(response.body.error).toBe('No access token found');
  });

  it('should return 401 if authorization header format is invalid', async () => {
    setupApp(false);
    const response = await request(app)
      .get('/test')
      .set('Authorization', 'InvalidToken');
    expect(response.status).toBe(HttpErrorCodes.UNAUTHORIZED);
    expect(response.body.error).toBe('Invalid access token format');
  });

  it('should return 401 if token is not valid', async () => {
    mockAuthService.verify.mockRejectedValue(new Error('Invalid token'));
    setupApp(false);
    const response = await request(app)
      .get('/test')
      .set('Authorization', 'Bearer invalidtoken');
    expect(response.status).toBe(HttpErrorCodes.UNAUTHORIZED);
    expect(response.body.error).toBe('Token is not valid');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should call next if token is valid and user is admin when adminOnly is true', async () => {
    mockAuthService.verify.mockResolvedValue({ role: 'admin', user: 1 });
    setupApp(true);
    const response = await request(app)
      .get('/test')
      .set('Authorization', 'Bearer validtoken');
    expect(response.status).toBe(200);
  });

  it('should call next if token is valid and adminOnly is false', async () => {
    mockAuthService.verify.mockResolvedValue({ role: 'user', user: 1 });
    setupApp(false);
    const response = await request(app)
      .get('/test')
      .set('Authorization', 'Bearer validtoken');
    expect(response.status).toBe(200);
  });

  it('should return 403 if adminOnly is true and user is not admin', async () => {
    mockAuthService.verify.mockResolvedValue({ user: 1 });
    setupApp(true);
    const response = await request(app)
      .get('/test')
      .set('Authorization', 'Bearer validtoken');
    expect(response.status).toBe(HttpErrorCodes.FORBIDDEN);
    expect(response.body.error).toBe(
      'You do not have permission to access this resource',
    );
  });
});
