import pino from 'pino'

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export class Logger {
    private logLevel: LogLevel
    private logger: pino.Logger

  constructor(level = LogLevel.DEBUG) {
    this.logLevel = level
    this.logger = pino({
        base: {},
        timestamp: false,
        level,
        messageKey: 'message',
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
        },
      })
  }

  debug(message: string, data?: any): void {
    this.logger.debug(message, data)
  }

  info(message: string, data?: any): void {
    this.logger.info(message, data)
  }

  warn(message: string, data?: any): void {
    this.logger.warn(message, data)
  }

  error(message: string, error?: any, data?: any): void {
    this.logger.error(message, error, data)
  }
}
