import IUserDbRepository from '../../application/repositories/userDbRepository';
import IAuthPasswordService from '../../application/services/auth/authPasswordService';
import IAuthTokenService from '../../application/services/auth/authTokenService';

import ucSignInPassword from '../../application/use-cases/auth/ucSignInPassword';
import HttpException from '../../errors/httpException';
import ILogger from '../../logger/logger';
import { Request, Response } from 'express';

export default class AuthController {
  constructor(
    private userDbRepository: IUserDbRepository,
    private authPasswordService: IAuthPasswordService,
    private authTokenService: IAuthTokenService,

    private logger: ILogger,
  ) {
    this.logger.info('Creating auth controller');
  }

  async signIn(req: Request, res: Response): Promise<void> {
    if (!req.body.email) throw HttpException.badRequest('Email is required');
    if (!req.body.password)
      throw HttpException.badRequest('Password is required');
    const token = await ucSignInPassword(
      req.body,
      this.userDbRepository,
      this.authPasswordService,
      this.authTokenService,
      this.logger,
    );
    res.status(201).send({ token: token });
  }
}
