import request from 'supertest';
import express from 'express';
import { Request, Response } from 'express';
import CachingMiddleware from './cachingMiddleware'; // Ensure this path is correct
import ICacheRepository from '../../../application/repositories/cacheRepository';
import ILogger from '../../../logger/logger';

const mockCacheRepository: ICacheRepository = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

const mockLogger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

const app = express();
app.use(express.json());
const CachingMiddlewareWithDefaultParam = CachingMiddleware(
  mockCacheRepository,
  'testKey',
  mockLogger,
);

app.get(
  '/test/:id',
  CachingMiddlewareWithDefaultParam,
  (_: Request, res: Response) => {
    res.status(200).json({ message: 'Cache miss' });
  },
);

describe('CachingMiddleware', () => {
  it('should return cached data if available', async () => {
    const cachedData = JSON.stringify({ message: 'Cached data' });
    (mockCacheRepository.get as jest.Mock).mockResolvedValueOnce(cachedData);

    const response = await request(app).get('/test/123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(JSON.parse(cachedData));
    expect(mockCacheRepository.get).toHaveBeenCalledWith('testKey_123');
  });

  it('should call next middleware if no cached data', async () => {
    (mockCacheRepository.get as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app).get('/test/123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Cache miss' });
    expect(mockCacheRepository.get).toHaveBeenCalledWith('testKey_123');
  });

  it('should log error if cache retrieval fails', async () => {
    const error = new Error('Cache error');
    (mockCacheRepository.get as jest.Mock).mockRejectedValueOnce(error);

    const response = await request(app).get('/test/123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Cache miss' });
    expect(mockLogger.error).toHaveBeenCalledWith(error);
  });

  it('should use default param name if name is not provided', async () => {
    const cachedData = JSON.stringify({ message: 'Cached data' });
    (mockCacheRepository.get as jest.Mock).mockResolvedValueOnce(cachedData);

    const response = await request(app).get('/test/123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(JSON.parse(cachedData));
    expect(mockCacheRepository.get).toHaveBeenCalledWith('testKey_123');
  });

  it('should use provided param name if name is provided', async () => {
    const appWithCustomParam = express();
    appWithCustomParam.use(express.json());
    appWithCustomParam.get(
      '/test/:customId',
      CachingMiddleware(mockCacheRepository, 'testKey', mockLogger, 'customId'),
      (_: Request, res: Response) => {
        res.status(200).json({ message: 'Cache miss' });
      },
    );

    const cachedData = JSON.stringify({ message: 'Cached data' });
    (mockCacheRepository.get as jest.Mock).mockResolvedValueOnce(cachedData);

    const response = await request(appWithCustomParam).get('/test/456');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(JSON.parse(cachedData));
    expect(mockCacheRepository.get).toHaveBeenCalledWith('testKey_456');
  });
});
