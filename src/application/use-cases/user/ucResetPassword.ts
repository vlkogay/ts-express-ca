import {
  UserNotFoundError,
  ValidatePasswordError,
} from '../../../errors/errors';
import HttpException from '../../../errors/httpException';
import ILogger from '../../../logger/logger';
import ResetPasswordDto from '../../core/dto/auth/resetPasswordDto';
import IUserDbRepository from '../../repositories/userDbRepository';
import IAuthPasswordService from '../../services/auth/authPasswordService';
import IEmailService from '../../services/email/emailService';
import ICacheRepository from '../../repositories/cacheRepository';
import { randomUUID } from 'crypto';

const TOKEN_DURATION = 1000 * 60 * 60 * 24; // 24 hours

type ResetPasswordResponse = {
  email: string;
  message: string;
};

export default async function ucResetPassword(
  dto: ResetPasswordDto,
  userDbRepository: IUserDbRepository,
  passwordService: IAuthPasswordService,
  cacheRepository: ICacheRepository,
  emailService: IEmailService,
  logger: ILogger,
): Promise<ResetPasswordResponse> | never {
  if (!dto.password) throw HttpException.badRequest('Password is required');

  try {
    const user = await userDbRepository.findUserByEmail(dto.email);
    passwordService.validatePassword(dto.password);
    if (!dto.token) {
      //if there is no token, generate one and send it to the user
      const token = randomUUID().toString();
      cacheRepository.set(
        'reset-password:' + user.email,
        token,
        TOKEN_DURATION,
      );

      emailService.sendEmail(
        user.email,
        'Reset Password',
        `Click here to reset your password: http://localhost:80/${token}`,
      );

      return { email: user.email, message: 'The token was sent to the email' };
    }
    //if there is a token, check if it is valid and reset the password
    const token = await cacheRepository.get('reset-password:' + user.email);
    if (token !== dto.token) throw HttpException.unauthorized('Invalid token');
    const persistedPassword = await passwordService.hashPassword(dto.password);
    await userDbRepository.setPersistedPassword(user.id, persistedPassword);
    await cacheRepository.delete('reset-password:' + user.email);
    return { email: user.email, message: 'The password has been changed' };
  } catch (e) {
    logger.error(e);
    if (e instanceof UserNotFoundError)
      throw HttpException.unauthorized('User not found');
    if (e instanceof ValidatePasswordError)
      throw HttpException.badRequest(e.message);
    if (e instanceof HttpException) throw e;
    else throw HttpException.internalServerError();
  }
}
