type UserId = number;
type PersistedPassword = {
  salt: string;
  hash: string;
  iterations: number;
};
type TokenPayload = {
  user: UserId;
  role?: string | undefined;
  exp?: string;
};

type Token = string;

declare namespace Express {
  export interface Request {
    user?: UserId;
  }
}
