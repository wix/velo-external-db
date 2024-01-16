import pino from 'pino'
import { ILogger, LogLevel, Data, LoggerError } from './types'

export class Logger implements ILogger {
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

  debug(message: string, data?: Data): void {
    this.logger.debug(message, data)
  }

  info(message: string, data?: Data): void {
    this.logger.info(message, data)
  }

  warn(message: string, data?: Data): void {
    this.logger.warn(message, data)
  }

  error(message: string, error?: LoggerError, data?: Data): void {
    this.logger.error(message, error, data)
  }
}
