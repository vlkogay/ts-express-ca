import getConfig from '../../src/config/config';
import CacheRedis from '../../src/frameworks/cache-redis/cacheRedis';
import ConsoleLogger from '../../src/logger/console-logger/consoleLogger';

const config = getConfig();
config.postgres.database = 'test'; // Test database!!1
const logger = new ConsoleLogger(config.logger);
const cacheRedis = new CacheRedis(config.redis, logger);

describe('UserDbRepository integration tests', () => {
  it('should set key value', async () => {
    await cacheRedis.set('key', 'value');
  });

  it('should get key value', async () => {
    await cacheRedis.set('key', 'value');
    const value = await cacheRedis.get('key');
    expect(value).toEqual('value');
  });

  it('should delete key', async () => {
    await cacheRedis.set('key', 'value');
    await cacheRedis.delete('key');
    const value = await cacheRedis.get('key');
    expect(value).toBeNull();
  });
});
