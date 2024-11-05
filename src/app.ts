import { AdminConfig, Config } from './config/config';
import { UserNotFoundError } from './errors/errors';
import CacheRedis from './frameworks/cache-redis/cacheRedis';
import DbPostgres from './frameworks/db-postgres/dbPostgres';
import UserDbRepository from './frameworks/db-postgres/repositories/userDbRepository';
import AuthPasswordService from './frameworks/services/auth/authPasswordService';
import PasetoAuthTokenService from './frameworks/services/auth/pasetoAuthTokenService';
import NodeMailerService from './frameworks/services/email/nodeMailerService';
import AuthRoutes from './frameworks/webserver-express/routes/authRoutes';
import UserRoutes from './frameworks/webserver-express/routes/userRoutes';
import WebServerExpress from './frameworks/webserver-express/webServerExpress';
import ConsoleLogger from './logger/console-logger/consoleLogger';
import ILogger from './logger/logger';

const authPasswordService = new AuthPasswordService();

async function createAdminUser(
  adminConfig: AdminConfig,
  userDbRepository: UserDbRepository,
  authPasswordService: AuthPasswordService,
) {
  if (!adminConfig.name || !adminConfig.email || !adminConfig.password) return;
  try {
    await userDbRepository.findUserByEmail(adminConfig.email);
    return;
  } catch (e) {
    if (e instanceof UserNotFoundError === false) throw e;
  }

  const password = await authPasswordService.hashPassword(adminConfig.password);
  await userDbRepository.createUser(
    { name: adminConfig.name, email: adminConfig.email, admin: true },
    password,
  );
}

async function createDbPepositories(config: Config, logger: ILogger) {
  const dbPostgres = new DbPostgres(config.postgres, logger);
  const userDbRepository = new UserDbRepository(dbPostgres, logger);
  await userDbRepository.createTable();
  await createAdminUser(config.admin, userDbRepository, authPasswordService);
  return { dbPostgres, userDbRepository };
}

export default async function start(config: Config) {
  const logger: ILogger = new ConsoleLogger(config.logger);

  const { dbPostgres, userDbRepository } = await createDbPepositories(
    config,
    logger,
  );

  const authTokenService = new PasetoAuthTokenService(config.paseto);
  await authTokenService.generateKeys();

  const cacheRepository = new CacheRedis(config.redis, logger);
  const emailService = new NodeMailerService(config.email, logger);

  const webServer = new WebServerExpress(config.webserver, logger);
  // user routes
  new UserRoutes(webServer.app, logger).init(
    userDbRepository,
    authPasswordService,
    authTokenService,
    cacheRepository,
    emailService,
  );
  // auth routes
  new AuthRoutes(webServer.app, logger).init(
    userDbRepository,
    authPasswordService,
    authTokenService,
  );
  await webServer.start();

  return {
    webServer,
    userDbRepository,
    authPasswordService,
    dbPostgres,
    cacheRepository,
  };
}
