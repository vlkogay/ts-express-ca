import AuthController from '../../../adapters/controllers/authController';

import IUserDbRepository from '../../../application/repositories/userDbRepository';
import IAuthPasswordService from '../../../application/services/auth/authPasswordService';
import IAuthTokenService from '../../../application/services/auth/authTokenService';

import Routes from '../routes';

export default class AuthRoutes extends Routes {
  public async init(
    userDbRepository: IUserDbRepository,
    authPasswordService: IAuthPasswordService,
    tokenService: IAuthTokenService,
  ): Promise<void> {
    const authController = new AuthController(
      userDbRepository,
      authPasswordService,
      tokenService,
      this.logger,
    );

    this.logger.info('Initializing auth routes...');

    this.post('/api/auth/signin', authController.signIn.bind(authController));

    this.logger.info('Routes auth initialized.');
  }
}
