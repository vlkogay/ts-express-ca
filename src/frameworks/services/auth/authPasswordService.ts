import * as crypto from 'crypto';
import IAuthPasswordService from '../../../application/services/auth/authPasswordService';
import { ValidatePasswordError } from '../../../errors/errors';

const PASSWORD_LENGTH = 256;
const SALT_LENGTH = 64;
const ITERATIONS = 3;
const DIGEST = 'sha256';
const BYTE_TO_STRING_ENCODING = 'hex'; // this could be base64, for instance

export default class AuthPasswordService implements IAuthPasswordService {
  async hashPassword(password: string): Promise<PersistedPassword> {
    if (!password) throw new Error('Password cannot be empty');
    return new Promise<PersistedPassword>((accept, reject) => {
      const salt = crypto
        .randomBytes(SALT_LENGTH)
        .toString(BYTE_TO_STRING_ENCODING);
      crypto.pbkdf2(
        password,
        salt,
        ITERATIONS,
        PASSWORD_LENGTH,
        DIGEST,
        (error, hash) => {
          if (error) {
            return reject(error);
          }

          accept({
            salt,
            hash: hash.toString(BYTE_TO_STRING_ENCODING),
            iterations: ITERATIONS,
          });
        },
      );
    });
  }

  validatePassword(password: string): void | never {
    if (!password) throw new Error('Password should not be empty');
    const input = password.trim();

    if (!input) {
      throw new ValidatePasswordError('Password should not be empty');
    }

    if (input.length < 8)
      throw new ValidatePasswordError(
        'Password should not be lesser than 8 characters.',
      );

    const hasNumber = /[0-9]+/;
    const hasUpperChar = /[A-Z]+/;
    const hasMiniMaxChars = /.{8,15}/;
    const hasLowerChar = /[a-z]+/;
    const hasSymbols = /[!@#$%^&*()_+=\[{\]};:<>|./?,-]/;

    if (!hasLowerChar.test(input))
      throw new ValidatePasswordError(
        'Password should contain at least one lower case letter.',
      );
    else if (!hasUpperChar.test(input))
      throw new ValidatePasswordError(
        'Password should contain at least one upper case letter.',
      );
    else if (!hasMiniMaxChars.test(input))
      throw new ValidatePasswordError(
        'Password should not be lesser than 8 or greater than 15 characters.',
      );
    else if (!hasNumber.test(input))
      throw new ValidatePasswordError(
        'Password should contain at least one numeric value.',
      );
    else if (!hasSymbols.test(input))
      throw new ValidatePasswordError(
        'Password should contain at least one special case character.',
      );
  }

  async verifyPassword(
    password: string,
    persistedPassword: PersistedPassword,
  ): Promise<boolean> {
    if (persistedPassword.hash === '' || persistedPassword.salt === '')
      throw new Error('Invalid persisted password');
    return new Promise<boolean>((accept, reject) => {
      crypto.pbkdf2(
        password,
        persistedPassword.salt,
        persistedPassword.iterations,
        PASSWORD_LENGTH,
        DIGEST,
        (error, hash) => {
          if (error) {
            return reject(error);
          }

          accept(
            persistedPassword.hash === hash.toString(BYTE_TO_STRING_ENCODING),
          );
        },
      );
    });
  }
}
