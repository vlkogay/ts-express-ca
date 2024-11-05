import ucSignPassword from './ucSignInPassword';
import { UserNotFoundError } from '../../../errors/errors';
import HttpException from '../../../errors/httpException';
import ILogger from '../../../logger/logger';
import SignInPasswordDto from '../../core/dto/auth/signInPasswordDto';
import IUserDbRepository from '../../repositories/userDbRepository';
import IAuthPasswordService from '../../services/auth/authPasswordService';
import IAuthTokenService from '../../services/auth/authTokenService';

describe('ucSignPassword', () => {
  let mockUserDbRepository: jest.Mocked<IUserDbRepository>;
  let mockPasswordService: jest.Mocked<IAuthPasswordService>;
  let mockTokenService: jest.Mocked<IAuthTokenService>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockUserDbRepository = {
      findUserByEmail: jest.fn(),
      getPersistedPasswordByEmail: jest.fn(),
      setPersistedPassword: jest.fn(),
      findUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      createTable: jest.fn(),
      deleteUserById: jest.fn(),
      deleteUserByEmail: jest.fn(),
      getPersistedPasswordById: jest.fn(),
    } as jest.Mocked<IUserDbRepository>;

    mockPasswordService = {
      validatePassword: jest.fn(),
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
    } as jest.Mocked<IAuthPasswordService>;

    mockTokenService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as jest.Mocked<IAuthTokenService>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as jest.Mocked<ILogger>;
  });

  it('should sign in user with correct credentials', async () => {
    const dto: SignInPasswordDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const user = {
      id: 1,
      email: 'test@email.test',
      name: 'test',
      admin: false,
    };
    const persistedPassword: PersistedPassword = {
      hash: 'hash',
      salt: 'salt',
      iterations: 10,
    };
    const token = 'jwtToken';

    mockUserDbRepository.findUserByEmail.mockResolvedValue(user);
    mockUserDbRepository.getPersistedPasswordByEmail.mockResolvedValue(
      persistedPassword,
    );
    mockPasswordService.verifyPassword.mockResolvedValue(true);
    mockTokenService.sign.mockResolvedValue(token);

    const result = await ucSignPassword(
      dto,
      mockUserDbRepository,
      mockPasswordService,
      mockTokenService,
      mockLogger,
    );

    expect(result).toBe(token);
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Signing ${dto.email} in with password...`,
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      `User "${user.id}" (admin=${user.admin})signed in with password`,
    );
  });

  it('should throw unauthorized error if password is incorrect', async () => {
    const dto: SignInPasswordDto = {
      email: 'test@example.com',
      password: 'wrongPassword',
    };
    const user = {
      id: 1,
      name: 'test',
      admin: false,
      email: 'test1@email.test',
    };
    const persistedPassword: PersistedPassword = {
      hash: 'hash',
      salt: 'salt',
      iterations: 10,
    };

    mockUserDbRepository.findUserByEmail.mockResolvedValue(user);
    mockUserDbRepository.getPersistedPasswordByEmail.mockResolvedValue(
      persistedPassword,
    );
    mockPasswordService.verifyPassword.mockResolvedValue(false);

    await expect(
      ucSignPassword(
        dto,
        mockUserDbRepository,
        mockPasswordService,
        mockTokenService,
        mockLogger,
      ),
    ).rejects.toThrow(
      HttpException.unauthorized('Email or password is incorrect'),
    );

    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should throw unauthorized error if user is not found', async () => {
    const dto: SignInPasswordDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockUserDbRepository.findUserByEmail.mockRejectedValue(
      new UserNotFoundError(),
    );

    await expect(
      ucSignPassword(
        dto,
        mockUserDbRepository,
        mockPasswordService,
        mockTokenService,
        mockLogger,
      ),
    ).rejects.toThrow(
      HttpException.unauthorized('Email or password is incorrect'),
    );

    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should throw internal server error for other errors', async () => {
    const dto: SignInPasswordDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockUserDbRepository.findUserByEmail.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      ucSignPassword(
        dto,
        mockUserDbRepository,
        mockPasswordService,
        mockTokenService,
        mockLogger,
      ),
    ).rejects.toThrow(HttpException.internalServerError());

    expect(mockLogger.error).toHaveBeenCalled();
  });
});
