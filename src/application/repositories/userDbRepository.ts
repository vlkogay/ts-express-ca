import CreateUserDto from '../core/dto/user/createUserDto';
import UpdateUserDto from '../core/dto/user/updateUserDto';
import User from '../core/entities/user';

export default interface IUserDbRepository {
  findUserById(id: UserId): Promise<User>;
  findUserByEmail(email: string): Promise<User>;
  deleteUserById(id: UserId): Promise<void>;
  deleteUserByEmail(email: string): Promise<void>;
  updateUser(dto: UpdateUserDto): Promise<void>;
  setPersistedPassword(
    id: UserId,
    persistedPassword: PersistedPassword,
  ): Promise<void>;
  getPersistedPasswordById(id: UserId): Promise<PersistedPassword>;
  getPersistedPasswordByEmail(email: string): Promise<PersistedPassword>;
  createUser(dto: CreateUserDto, password: PersistedPassword): Promise<UserId>;
  createTable(): Promise<void>;
}
