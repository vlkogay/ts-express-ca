import {
  UserNotFoundError,
  ValidatePasswordError,
} from '../../../errors/errors';
import HttpException from '../../../errors/httpException';
import ValidationUtils from '../../../utils/validationUtils';
import CreateUserDto from '../../core/dto/user/createUserDto';
import IUserDbRepository from '../../repositories/userDbRepository';
import IAuthPasswordService from '../../services/auth/authPasswordService';

export default async function ucCreateUser(
  dto: CreateUserDto,
  userDbRepository: IUserDbRepository,
  passwordService: IAuthPasswordService,
): Promise<UserId> | never {
  if (dto.email.length > 255)
    throw HttpException.badRequest('Email is too long');
  if (!ValidationUtils.isEmailValid(dto.email))
    throw HttpException.badRequest('Email is not valid');
  if (dto.name.length > 255) throw HttpException.badRequest('Name is too long');
  if (!dto.password) throw HttpException.badRequest('Password is required');

  try {
    passwordService.validatePassword(dto.password);
    await userDbRepository.findUserByEmail(dto.email);
    throw HttpException.alreadyExists('User already exists');
  } catch (e) {
    if (e instanceof ValidatePasswordError)
      throw HttpException.badRequest(e.message);
    else if (e instanceof UserNotFoundError === false) throw e;
  }
  const persistedPassword = await passwordService.hashPassword(dto.password);
  return await userDbRepository.createUser(dto, persistedPassword);
}
