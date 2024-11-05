import ucCreateUser from './ucCreateUser';
import HttpException from '../../../errors/httpException';
import ValidationUtils from '../../../utils/validationUtils';
import CreateUserDto from '../../core/dto/user/createUserDto';
import IUserDbRepository from '../../repositories/userDbRepository';
import IAuthPasswordService from '../../services/auth/authPasswordService';
import {
  UserNotFoundError,
  ValidatePasswordError,
} from '../../../errors/errors';

describe('ucCreateUser', () => {
  let userDbRepository: IUserDbRepository;
  let passwordService: IAuthPasswordService;
  let dto: CreateUserDto;

  beforeEach(() => {
    userDbRepository = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
    } as unknown as IUserDbRepository;

    jest.spyOn(ValidationUtils, 'isEmailValid').mockReturnValue(true);

    passwordService = {
      validatePassword: jest.fn().mockReturnValue(true),
      hashPassword: jest.fn(),
    } as unknown as IAuthPasswordService;

    dto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123!',
    };
  });

  it('should throw an error if email is too long', async () => {
    dto.email = 'a'.repeat(256);
    await expect(
      ucCreateUser(dto, userDbRepository, passwordService),
    ).rejects.toThrow(HttpException.badRequest('Email is too long'));
  });

  it('should throw an error if email is not valid', async () => {
    jest.spyOn(ValidationUtils, 'isEmailValid').mockReturnValue(false);
    await expect(
      ucCreateUser(dto, userDbRepository, passwordService),
    ).rejects.toThrow(HttpException.badRequest('Email is not valid'));
  });

  it('should throw an error if name is too long', async () => {
    dto.name = 'a'.repeat(256);
    await expect(
      ucCreateUser(dto, userDbRepository, passwordService),
    ).rejects.toThrow(HttpException.badRequest('Name is too long'));
  });

  it('should throw an error if password is not provided', async () => {
    dto.password = '';
    await expect(
      ucCreateUser(dto, userDbRepository, passwordService),
    ).rejects.toThrow(HttpException.badRequest('Password is required'));
  });

  it('should throw an error if password validation fails', async () => {
    jest.spyOn(passwordService, 'validatePassword').mockImplementation(() => {
      throw new ValidatePasswordError('Invalid password');
    });
    await expect(
      ucCreateUser(dto, userDbRepository, passwordService),
    ).rejects.toThrow(HttpException.badRequest('Invalid password'));
  });

  it('should throw an error if user already exists', async () => {
    jest.spyOn(userDbRepository, 'findUserByEmail').mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@email.test',
      admin: false,
    });
    await expect(
      ucCreateUser(dto, userDbRepository, passwordService),
    ).rejects.toThrow(HttpException.alreadyExists('User already exists'));
  });

  it('should create a new user if all validations pass', async () => {
    jest.spyOn(userDbRepository, 'findUserByEmail').mockImplementation(() => {
      throw new UserNotFoundError();
    });
    jest.spyOn(passwordService, 'hashPassword').mockResolvedValue({
      hash: 'hashedPassword',
      salt: 'salt',
      iterations: 10,
    });
    jest.spyOn(userDbRepository, 'createUser').mockResolvedValue(1);

    const result = await ucCreateUser(dto, userDbRepository, passwordService);

    expect(result).toBe(1);
    expect(passwordService.hashPassword).toHaveBeenCalledWith(dto.password);
  });
});
