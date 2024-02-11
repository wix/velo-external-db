

export type LoggerError = any;

export type Data = Record<string, unknown> | undefined;

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface ILogger {
    debug(message: string, data?: Data): void;
    info(message: string, data?: Data): void;
    warn(message: string, data?: Data): void;
    error(message: string, error: LoggerError, data?: Data): void;
}
