import { LoggerConfig } from '../../config/config';
import ILogger from '../logger';

enum LogLevel {
  info = 1,
  warn = 3,
  error = 4,
  none = 5,
}

export default class ConsoleLogger implements ILogger {
  private logLevel: LogLevel;

  constructor(LoggerConfig: LoggerConfig) {
    this.logLevel = LogLevel[LoggerConfig.level as keyof typeof LogLevel];
  }
  /**
   * info - Logs an info message
   * ----------------------------------------
   * @param message    The message to log
   */
  info(message: string): void {
    if (this.logLevel > LogLevel.info) return;
    console.log(`[INFO] ${message}`);
  }
  /**
   * error - Logs an error message
   * ----------------------------------------
   * @param error  The error to log
   */
  error(error: unknown): void {
    if (this.logLevel > LogLevel.error) return;
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else if (error instanceof String) {
      message = error;
    } else if (typeof error === 'string') {
      message = error;
    } else message = JSON.stringify(error);
    console.log(`[ERROR] ${message}`);
  }
  /**
   * warn - Logs a warning message
   * ----------------------------------------
   * @param message  The message to log
   */
  warn(message: string): void {
    if (this.logLevel > LogLevel.warn) return;
    console.log(`[WARN] ${message}`);
  }
}
