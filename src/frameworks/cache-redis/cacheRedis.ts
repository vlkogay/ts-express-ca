import ICacheRepository from '../../application/repositories/cacheRepository';
import { RedisConfig } from '../../config/config';
import { Redis } from 'ioredis';
import ILogger from '../../logger/logger';

export default class CacheRedis implements ICacheRepository {
  private client: Redis;
  constructor(config: RedisConfig, private logger: ILogger) {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
    });
    this.client.on('error', (err: Error) => {
      this.logger.error(err);
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    }
    await this.client.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
