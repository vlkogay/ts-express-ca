import UserController from '../../../adapters/controllers/userController';
import IUserDbRepository from '../../../application/repositories/userDbRepository';
import IAuthPasswordService from '../../../application/services/auth/authPasswordService';
import IAuthTokenService from '../../../application/services/auth/authTokenService';
import authMiddleware from '../middlewares/authMiddleware';
import IEmailService from '../../../application/services/email/emailService';
import Routes from '../routes';
import ICacheRepository from '../../../application/repositories/cacheRepository';

export default class UserRoutes extends Routes {
  public async init(
    userDbRepository: IUserDbRepository,
    authPasswordService: IAuthPasswordService,
    authTokenService: IAuthTokenService,
    cacheRepository: ICacheRepository,
    emailService: IEmailService,
  ): Promise<void> {
    const userController = new UserController(
      userDbRepository,
      authPasswordService,
      cacheRepository,
      emailService,
      this.logger,
    );

    this.logger.info('Initializing user routes...');

    this.delete(
      '/api/users/:id',
      userController.deleteUser.bind(userController),
      authMiddleware(authTokenService, this.logger, { admin: true }),
    );
    this.delete(
      '/api/users/email/:email',
      userController.deleteUserByEmail.bind(userController),
      authMiddleware(authTokenService, this.logger, { admin: true }),
    );
    this.post(
      '/api/users',
      userController.createUser.bind(userController),
      authMiddleware(authTokenService, this.logger, { admin: true }),
    );

    this.post(
      '/api/users/reset-password',
      userController.resetPassword.bind(userController),
    );

    this.logger.info('Routes user initialized.');
  }
}
