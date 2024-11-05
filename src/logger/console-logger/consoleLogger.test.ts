import ConsoleLogger from './consoleLogger';
import { LoggerConfig } from '../../config/config';

describe('ConsoleLogger', () => {
  let consoleSpy: jest.SpyInstance;
  let logger: ConsoleLogger;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log info messages when log level is info', () => {
    const config: LoggerConfig = { level: 'info' };
    logger = new ConsoleLogger(config);

    logger.info('This is an info message');

    expect(consoleSpy).toHaveBeenCalledWith('[INFO] This is an info message');
  });

  it('should not log info messages when log level is warn', () => {
    const config: LoggerConfig = { level: 'warn' };
    logger = new ConsoleLogger(config);

    logger.info('This is an info message');

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should log warn messages when log level is warn', () => {
    const config: LoggerConfig = { level: 'warn' };
    logger = new ConsoleLogger(config);

    logger.warn('This is a warning message');

    expect(consoleSpy).toHaveBeenCalledWith('[WARN] This is a warning message');
  });

  it('should not log warn messages when log level is error', () => {
    const config: LoggerConfig = { level: 'error' };
    logger = new ConsoleLogger(config);

    logger.warn('This is a warning message');

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should log error messages when log level is error', () => {
    const config: LoggerConfig = { level: 'error' };
    logger = new ConsoleLogger(config);

    logger.error(new Error('This is an error message'));

    expect(consoleSpy).toHaveBeenCalledWith('[ERROR] This is an error message');
  });

  it('should log error messages when log level is warn', () => {
    const config: LoggerConfig = { level: 'warn' };
    logger = new ConsoleLogger(config);

    logger.error(new Error('This is an error message'));

    expect(consoleSpy).toHaveBeenCalledWith('[ERROR] This is an error message');
  });

  it('should log error messages when log level is info', () => {
    const config: LoggerConfig = { level: 'info' };
    logger = new ConsoleLogger(config);

    logger.error(new Error('This is an error message'));

    expect(consoleSpy).toHaveBeenCalledWith('[ERROR] This is an error message');
  });

  it('should log string error messages', () => {
    const config: LoggerConfig = { level: 'info' };
    logger = new ConsoleLogger(config);

    logger.error('This is a string error message');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[ERROR] This is a string error message',
    );
  });

  it('should log object error messages', () => {
    const config: LoggerConfig = { level: 'info' };
    logger = new ConsoleLogger(config);

    logger.error({ error: 'This is an object error message' });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[ERROR] {"error":"This is an object error message"}',
    );
  });
});
