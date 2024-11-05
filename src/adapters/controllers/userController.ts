import IUserDbRepository from '../../application/repositories/userDbRepository';
import IAuthPasswordService from '../../application/services/auth/authPasswordService';
import ucCreateUser from '../../application/use-cases/user/ucCreateUser';
import ucResetPassword from '../../application/use-cases/user/ucResetPassword';
import HttpException from '../../errors/httpException';
import ILogger from '../../logger/logger';
import ICacheRepository from '../../application/repositories/cacheRepository';
import IEmailService from '../../application/services/email/emailService';
import { Request, Response } from 'express';

export default class UserController {
  constructor(
    private userDbRepository: IUserDbRepository,
    private authPasswordService: IAuthPasswordService,
    private cacheRepository: ICacheRepository,
    private emailService: IEmailService,
    private logger: ILogger,
  ) {}

  async getUser(req: Request, res: Response): Promise<void> {
    const userId = req.user;
    if (!userId) throw HttpException.badRequest('User ID not found in request');

    const user = await this.userDbRepository.findUserById(userId);
    res.json(user);
  }

  async getUserByEmail(req: Request, res: Response): Promise<void> {
    const email = req.params['email'];
    if (!email)
      throw HttpException.badRequest('User Email not found in request');

    const user = await this.userDbRepository.findUserByEmail(email);
    res.json(user);
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const userId = req.params['id'];
    if (!userId) throw HttpException.badRequest('User ID not found in request');

    await this.userDbRepository.deleteUserById(Number(userId));
    res.status(204).send();
  }

  async deleteUserByEmail(req: Request, res: Response): Promise<void> {
    const email = req.params['email'];
    if (!email)
      throw HttpException.badRequest('User Email not found in request');

    await this.userDbRepository.deleteUserByEmail(email);
    res.status(204).send();
  }

  async createUser(req: Request, res: Response): Promise<void> {
    this.logger.info('Creating user...');
    const { name, email, password } = req.body;
    if (!name || !email)
      throw HttpException.badRequest('Name and email are required');

    if (!password) throw HttpException.badRequest('Password is required');

    const userId = await ucCreateUser(
      { name, email, password },
      this.userDbRepository,
      this.authPasswordService,
    );
    res.status(201).json({ id: userId });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    if (!req.body.email) throw HttpException.badRequest('Email is required');
    if (!req.body.password)
      throw HttpException.badRequest('Password is required');
    res
      .status(201)
      .send(
        await ucResetPassword(
          req.body,
          this.userDbRepository,
          this.authPasswordService,
          this.cacheRepository,
          this.emailService,
          this.logger,
        ),
      );
  }
}
