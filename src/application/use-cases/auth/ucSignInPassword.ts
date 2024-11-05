import { UserNotFoundError } from '../../../errors/errors';
import HttpException from '../../../errors/httpException';
import ILogger from '../../../logger/logger';
import SignInPasswordDto from '../../core/dto/auth/signInPasswordDto';
import IUserDbRepository from '../../repositories/userDbRepository';
import IAuthPasswordService from '../../services/auth/authPasswordService';
import IAuthTokenService from '../../services/auth/authTokenService';

export default async function ucSignPassword(
  dto: SignInPasswordDto,
  userDbRepository: IUserDbRepository,
  passwordService: IAuthPasswordService,
  tokenService: IAuthTokenService,
  logger: ILogger,
): Promise<Token> {
  logger.info(`Signing ${dto.email} in with password...`);

  try {
    const user = await userDbRepository.findUserByEmail(dto.email);
    const persistedPassword =
      await userDbRepository.getPersistedPasswordByEmail(dto.email);

    if (
      !(await passwordService.verifyPassword(dto.password, persistedPassword))
    )
      throw HttpException.unauthorized('Email or password is incorrect');
    logger.info(
      `User "${user.id}" (admin=${user.admin})signed in with password`,
    );
    const tokenPayload = {
      user: user.id,
      role: user.admin ? 'admin' : undefined,
    };

    return await tokenService.sign(tokenPayload);
  } catch (e) {
    logger.error(e);
    if (e instanceof UserNotFoundError)
      throw HttpException.unauthorized('Email or password is incorrect');
    else if (e instanceof HttpException) throw e;
    else throw HttpException.internalServerError();
  }
}
