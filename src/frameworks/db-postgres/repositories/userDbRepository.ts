import CreateUserDto from '../../../application/core/dto/user/createUserDto';
import UpdateUserDto from '../../../application/core/dto/user/updateUserDto';
import User from '../../../application/core/entities/user';
import IUserDbRepository from '../../../application/repositories/userDbRepository';
import DbPostgres from '../dbPostgres';
import ILogger from '../../../logger/logger';
import { UserNotFoundError } from '../../../errors/errors';

export default class UserDbRepository implements IUserDbRepository {
  constructor(private db: DbPostgres, private logger: ILogger) {}

  async findUserById(id: UserId): Promise<User> | never {
    const result = await this.db.pool.query(
      'SELECT name, email, admin, createdAt, updatedAt FROM users WHERE id = $1',
      [id],
    );
    if (result.rowCount === 0) throw new UserNotFoundError();
    const user = result.rows[0];
    return user;
  }

  async findUserByEmail(email: string): Promise<User> | never {
    const result = await this.db.pool.query(
      'SELECT id, name, email, admin, createdAt, updatedAt FROM users WHERE email = $1',
      [email],
    );
    if (result.rowCount === 0) throw new UserNotFoundError();
    const user = result.rows[0];
    return user;
  }

  async deleteUserById(id: UserId): Promise<void> {
    await this.db.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async deleteUserByEmail(email: string): Promise<void> {
    await this.db.pool.query('DELETE FROM users WHERE email = $1', [email]);
  }

  async updateUser(dto: UpdateUserDto): Promise<void> {
    this.db.pool.query(
      'UPDATE users SET name = $2, active = $3, updatedat= NOW() WHERE id = $1',
      [dto.id, dto.name, dto.active],
    );
  }

  async setPersistedPassword(
    id: UserId,
    persistedPassword: PersistedPassword,
  ): Promise<void> {
    await this.db.pool.query(
      'UPDATE users SET hash = $2, salt = $3, iterations=$4, updatedat= NOW() WHERE id = $1',
      [
        id,
        persistedPassword.hash,
        persistedPassword.salt,
        persistedPassword.iterations,
      ],
    );
  }

  async getPersistedPasswordById(id: UserId): Promise<PersistedPassword> {
    const result = await this.db.pool.query(
      'SELECT hash, salt, iterations FROM users WHERE id = $1',
      [id],
    );
    if (result.rowCount === 0) throw new UserNotFoundError();
    return result.rows[0];
  }

  async getPersistedPasswordByEmail(email: string): Promise<PersistedPassword> {
    const result = await this.db.pool.query(
      'SELECT hash, salt, iterations FROM users WHERE email = $1',
      [email],
    );
    if (result.rowCount === 0) throw new UserNotFoundError();
    return result.rows[0];
  }
  /**
   * Create a user
   * ----------------------------------------------------------------
   * @param {CreateUserDto} dto - The user data
   * @param {PersistedPassword} password - The user password
   * @returns {Promise<UserId>}
   * ----------------------------------------------------------------
   */
  async createUser(
    dto: CreateUserDto,
    password: PersistedPassword,
  ): Promise<UserId> {
    const result = await this.db.pool.query(
      'INSERT INTO "users" (email, name, hash, salt, iterations, "admin") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        dto.email,
        dto.name,
        password.hash,
        password.salt,
        password.iterations,
        dto.admin,
      ],
    );

    return result.rows[0].id;
  }
  /**
   * Create the users table if it does not exist
   * @returns {Promise<void>}
   */
  async createTable(): Promise<void> {
    this.logger.info('Creating users table');
    await this.db.pool.query(
      `begin;
      CREATE TABLE IF NOT EXISTS "users" (
      id SERIAL PRIMARY KEY, 
      email VARCHAR(255) NOT NULL, 
      name VARCHAR(255) NOT NULL, 
      hash TEXT, 
      salt TEXT, 
      iterations INT,
      active BOOLEAN DEFAULT TRUE,
      admin BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT NOW(), 
      updatedAt TIMESTAMP DEFAULT NOW(),
      UNIQUE(email)
      );
      commit;`,
    );
  }

  async dropTable(): Promise<void> {
    this.logger.info('Dropping users table');
    await this.db.pool.query('begin; DROP TABLE IF EXISTS "users"; commit;');
  }

  async clearTable(): Promise<void> {
    this.logger.info('Clearing users table');
    await this.db.pool.query('begin; DELETE FROM "users"; commit;');
  }
}
