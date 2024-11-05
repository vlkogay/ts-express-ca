export default interface User {
  id: UserId;
  name: string;
  email: string;
  admin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
