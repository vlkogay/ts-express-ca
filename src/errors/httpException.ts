export enum HttpErrorCodes {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export default class HttpException extends Error {
  code: HttpErrorCodes;

  constructor(code: HttpErrorCodes, message: string) {
    super(message);
    this.code = code;
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    } else if (error instanceof HttpException) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    }
    return 'An error occurred';
  }

  static badRequest(error?: unknown): HttpException {
    return new HttpException(
      HttpErrorCodes.BAD_REQUEST,
      HttpException.getErrorMessage(error),
    );
  }

  static internalServerError(error?: unknown): HttpException {
    return new HttpException(
      HttpErrorCodes.INTERNAL_SERVER_ERROR,
      error ? HttpException.getErrorMessage(error) : 'An error occurred',
    );
  }

  static alreadyExists(error?: unknown): HttpException {
    return new HttpException(
      HttpErrorCodes.FORBIDDEN,
      error ? HttpException.getErrorMessage(error) : 'Resource already exists',
    );
  }

  static unauthorized(error?: unknown): HttpException {
    return new HttpException(
      HttpErrorCodes.UNAUTHORIZED,
      error ? HttpException.getErrorMessage(error) : 'Resource already exists',
    );
  }
}
