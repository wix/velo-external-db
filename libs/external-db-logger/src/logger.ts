import pino from 'pino'
import { ILogger, LogLevel, Data, LoggerError } from './types'

export class Logger implements ILogger {
    private logLevel: LogLevel
    private logger: pino.Logger

  constructor() {
    this.logLevel = process.env['LOG_LEVEL']?.toLocaleLowerCase() as LogLevel || LogLevel.INFO
    this.logger = pino({
        base: {},
        timestamp: false,
        level: this.logLevel,
        messageKey: 'message',
        formatters: {
          level: (label) => ({  
            severity: label.toUpperCase(),
          }),
        },
      })
  }

  debug(message: string, data?: Data): void {
    this.logger.debug({ data }, message)
  }

  info(message: string, data?: Data): void {
    this.logger.info({ data }, message)
  }

  warn(message: string, data?: Data): void {
    this.logger.warn({ data }, message)
  }

  error(message: string, error?: LoggerError, data?: Data): void {
    this.logger.error(error, message, data)
  }
}
