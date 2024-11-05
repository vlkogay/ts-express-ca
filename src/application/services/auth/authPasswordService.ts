export default interface IAuthPasswordService {
  hashPassword(password: string): Promise<PersistedPassword>;
  verifyPassword(
    password: string,
    persistedPassword: PersistedPassword,
  ): Promise<boolean>;
  validatePassword(password: string): void | never;
}
