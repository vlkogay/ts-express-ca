export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message);
  }
}

export class KeyNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message);
  }
}

export class ValidatePasswordError extends Error {
  constructor(message = 'User not found') {
    super(message);
  }
}
