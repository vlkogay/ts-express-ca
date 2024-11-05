export default interface ILogger {
  /**
   * info - Logs an info message
   * ----------------------------------------
   * @param message    The message to log
   */
  info(message: string): void;
  /**
   * error - Logs an error message
   * ----------------------------------------
   * @param error  The error to log
   */
  error(error: unknown): void;
  /**
   * warn - Logs a warning message
   * ----------------------------------------
   * @param message  The message to log
   */
  warn(message: string): void;
}
