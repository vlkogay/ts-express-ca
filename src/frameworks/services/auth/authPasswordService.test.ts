import AuthPasswordService from './authPasswordService';

describe('AuthPasswordService', () => {
  let authPasswordService: AuthPasswordService;

  beforeEach(() => {
    authPasswordService = new AuthPasswordService();
  });

  describe('hashPassword', () => {
    it('should generate a hashed password with salt and iterations', async () => {
      const password = 'testPassword';
      const persistedPassword: PersistedPassword =
        await authPasswordService.hashPassword(password);

      expect(persistedPassword).toHaveProperty('salt');
      expect(persistedPassword).toHaveProperty('hash');
      expect(persistedPassword).toHaveProperty('iterations');
    });

    it('should throw an error if password is empty', async () => {
      await expect(authPasswordService.hashPassword('')).rejects.toThrow();
    });
  });

  describe('verifyPassword', () => {
    it('should return true for a correct password', async () => {
      const password = 'testPassword';
      const persistedPassword: PersistedPassword =
        await authPasswordService.hashPassword(password);

      const isValid = await authPasswordService.verifyPassword(
        password,
        persistedPassword,
      );
      expect(isValid).toBe(true);
    });

    it('should return false for an incorrect password', async () => {
      const password = 'testPassword';
      const wrongPassword = 'wrongPassword';
      const persistedPassword: PersistedPassword =
        await authPasswordService.hashPassword(password);

      const isValid = await authPasswordService.verifyPassword(
        wrongPassword,
        persistedPassword,
      );
      expect(isValid).toBe(false);
    });

    it('should throw an error if persistedPassword is invalid', async () => {
      const password = 'testPassword';
      const invalidPersistedPassword: PersistedPassword = {
        salt: '',
        hash: '',
        iterations: 10000,
      };

      await expect(
        authPasswordService.verifyPassword(password, invalidPersistedPassword),
      ).rejects.toThrow();
    });
  });

  it('should throw an error if password is empty', async () => {
    expect(() => authPasswordService.validatePassword('')).toThrow(
      'Password should not be empty',
    );
  });

  it('should throw an error if password is less than 8 characters', () => {
    expect(() => authPasswordService.validatePassword('1234567')).toThrow(
      'Password should not be lesser than 8 characters.',
    );
  });

  it('should throw an error if password does not contain a lower case letter', () => {
    expect(() => authPasswordService.validatePassword('PASSWORD')).toThrow(
      'Password should contain at least one lower case letter.',
    );
  });

  it('should throw an error if password does not contain an upper case letter', () => {
    expect(() => authPasswordService.validatePassword('password')).toThrow(
      'Password should contain at least one upper case letter.',
    );
  });

  it('should throw an error if password does not contain a number', () => {
    expect(() => authPasswordService.validatePassword('Password')).toThrow(
      'Password should contain at least one numeric value.',
    );
  });

  it('should throw an error if password does not contain a special character', () => {
    expect(() => authPasswordService.validatePassword('Password1')).toThrow(
      'Password should contain at least one special case character.',
    );
  });

  it('should not throw an error if password is valid', () => {
    expect(() =>
      authPasswordService.validatePassword('Password1@'),
    ).not.toThrow();
  });
});
