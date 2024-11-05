import ucResetPassword from './ucResetPassword';
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

describe('ucResetPassword', () => {
  let userDbRepository: IUserDbRepository;
  let passwordService: IAuthPasswordService;
  let cacheRepository: ICacheRepository;
  let emailService: IEmailService;
  let logger: ILogger;

  beforeEach(() => {
    userDbRepository = {
      findUserByEmail: jest.fn(),
      setPersistedPassword: jest.fn(),
    } as unknown as IUserDbRepository;

    passwordService = {
      validatePassword: jest.fn(),
      hashPassword: jest.fn(),
    } as unknown as IAuthPasswordService;

    cacheRepository = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    } as unknown as ICacheRepository;

    emailService = {
      sendEmail: jest.fn(),
    } as unknown as IEmailService;

    logger = {
      error: jest.fn(),
    } as unknown as ILogger;
  });

  it('should throw an error if password is not provided', async () => {
    const dto = { password: '' } as ResetPasswordDto;
    await expect(
      ucResetPassword(
        dto,
        userDbRepository,
        passwordService,
        cacheRepository,
        emailService,
        logger,
      ),
    ).rejects.toThrow(HttpException.badRequest('Password is required'));
  });

  it('should send a reset token if no token is provided', async () => {
    const dto = {
      password: 'newPassword',
      email: 'user@example.com',
    } as ResetPasswordDto;
    const user = { id: 'userId', email: 'user@example.com' };
    (userDbRepository.findUserByEmail as jest.Mock).mockResolvedValue(user);
    (passwordService.validatePassword as jest.Mock).mockReturnValue(true);

    const response = await ucResetPassword(
      dto,
      userDbRepository,
      passwordService,
      cacheRepository,
      emailService,
      logger,
    );

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      user.email,
      'Reset Password',
      expect.stringContaining('Click here to reset your password'),
    );
    expect(cacheRepository.set).toHaveBeenCalledWith(
      'reset-password:' + user.email,
      expect.any(String),
      expect.any(Number),
    );
    expect(response).toEqual({
      email: user.email,
      message: 'The token was sent to the email',
    });
  });

  it('should reset the password if a valid token is provided', async () => {
    const dto = {
      password: 'newPassword',
      token: 'validToken',
      email: 'user@example.com',
    } as ResetPasswordDto;
    const user = { id: 'userId', email: 'user@example.com' };
    (userDbRepository.findUserByEmail as jest.Mock).mockResolvedValue(user);
    (passwordService.validatePassword as jest.Mock).mockReturnValue(true);
    (cacheRepository.get as jest.Mock).mockResolvedValue('validToken');
    (passwordService.hashPassword as jest.Mock).mockResolvedValue(
      'hashedPassword',
    );

    const response = await ucResetPassword(
      dto,
      userDbRepository,
      passwordService,
      cacheRepository,
      emailService,
      logger,
    );

    expect(cacheRepository.get).toHaveBeenCalledWith(
      'reset-password:' + user.email,
    );
    expect(userDbRepository.setPersistedPassword).toHaveBeenCalledWith(
      user.id,
      'hashedPassword',
    );
    expect(cacheRepository.delete).toHaveBeenCalledWith(
      'reset-password:' + user.email,
    );
    expect(response).toEqual({
      email: user.email,
      message: 'The password has been changed',
    });
  });

  it('should throw an error if an invalid token is provided', async () => {
    const dto = {
      password: 'newPassword',
      token: 'invalidToken',
      email: 'user@example.com',
    } as ResetPasswordDto;
    const user = { id: 'userId', email: 'user@example.com' };
    (userDbRepository.findUserByEmail as jest.Mock).mockResolvedValue(user);
    (passwordService.validatePassword as jest.Mock).mockReturnValue(true);
    (cacheRepository.get as jest.Mock).mockResolvedValue('validToken');

    await expect(
      ucResetPassword(
        dto,
        userDbRepository,
        passwordService,
        cacheRepository,
        emailService,
        logger,
      ),
    ).rejects.toThrow(HttpException.unauthorized('Invalid token'));
  });

  it('should handle UserNotFoundError', async () => {
    const dto = {
      password: 'newPassword',
      email: 'user@example.com',
    } as ResetPasswordDto;
    (userDbRepository.findUserByEmail as jest.Mock).mockRejectedValue(
      new UserNotFoundError(),
    );

    await expect(
      ucResetPassword(
        dto,
        userDbRepository,
        passwordService,
        cacheRepository,
        emailService,
        logger,
      ),
    ).rejects.toThrow(HttpException.unauthorized('User not found'));
  });

  it('should handle ValidatePasswordError', async () => {
    const dto = {
      password: 'invalidPassword',
      email: 'user@example.com',
    } as ResetPasswordDto;
    const user = { id: 1, email: 'user@example.com' };
    (userDbRepository.findUserByEmail as jest.Mock).mockResolvedValue(user);
    (passwordService.validatePassword as jest.Mock).mockImplementation(() => {
      throw new ValidatePasswordError('Invalid password');
    });

    await expect(
      ucResetPassword(
        dto,
        userDbRepository,
        passwordService,
        cacheRepository,
        emailService,
        logger,
      ),
    ).rejects.toThrow(HttpException.badRequest('Invalid password'));
  });

  it('should handle unexpected errors', async () => {
    const dto = {
      password: 'newPassword',
      email: 'user@example.com',
    } as ResetPasswordDto;
    const user = { id: 1, email: 'user@example.com' };
    (userDbRepository.findUserByEmail as jest.Mock).mockResolvedValue(user);
    (passwordService.validatePassword as jest.Mock).mockReturnValue(true);
    (cacheRepository.set as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    await expect(
      ucResetPassword(
        dto,
        userDbRepository,
        passwordService,
        cacheRepository,
        emailService,
        logger,
      ),
    ).rejects.toThrow(HttpException.internalServerError());
  });
});
