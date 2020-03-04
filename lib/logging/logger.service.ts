import * as clc from "cli-color";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import { LoggerOptions, LoggerTransport, ConfiguredTransport, LogLevel } from "./logger.interface";
import { ConsoleTransportOptions } from "winston/lib/winston/transports";

export class LoggerService {

  public static DEFAULT_TIME_FORMAT = "HH:mm:ss";
  public static DEFAULT_LEVEL: LogLevel = "info";
  public static DEFAULT_FILENAME = "-";

  private static DEFAULT_FILE_OPTIONS: DailyRotateFile.DailyRotateFileTransportOptions = {
    filename: LoggerService.DEFAULT_FILENAME,
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxFiles: "10d",
    options: { flags: "a", mode: "0776" },
  };

  private static DEFAULT_CONSOLE_OPTIONS: ConsoleTransportOptions = {};

  private static DEFAULT_LOGGER_OPTIONS: LoggerOptions = {
    timeFormat: LoggerService.DEFAULT_TIME_FORMAT,
    fileOptions: LoggerService.DEFAULT_FILE_OPTIONS,
    consoleOptions: LoggerService.DEFAULT_CONSOLE_OPTIONS,
    colorize: true,
  };

  private logger: winston.Logger;
  private requestId: string;
  private context: string;

  constructor(
    level: string,
    loggers: ConfiguredTransport[],
    ) {

    loggers.forEach(logger => logger.transport.format = this.defaultFormatter(logger.options));
    this.logger = winston.createLogger({
      level,
      transports: loggers.map(l => l.transport),
  });
  }

  public static getLoggers(transportNames: LoggerTransport[], options?: LoggerOptions) : ConfiguredTransport[] {
    const loggers = [] as ConfiguredTransport[];
    if (transportNames.indexOf(LoggerTransport.CONSOLE) >= 0) {
      loggers.push(LoggerService.console(options));
    }
    if (transportNames.indexOf(LoggerTransport.ROTATE) >= 0) {
      loggers.push(LoggerService.rotate(options));
    }
    return loggers;
  }

  public static console(options?: LoggerOptions): ConfiguredTransport {
    const defaultOptions = Object.assign({}, LoggerService.DEFAULT_LOGGER_OPTIONS);
    const consoleLoggerOptions = Object.assign(defaultOptions, options);
    const consoleTransportOptions = Object.assign(defaultOptions.consoleOptions, consoleLoggerOptions.consoleOptions);
    const transport = new winston.transports.Console(consoleTransportOptions);
    return { transport, options: consoleLoggerOptions };
  }

  public static rotate(options?: LoggerOptions): ConfiguredTransport {
    const defaultOptions = Object.assign({}, LoggerService.DEFAULT_LOGGER_OPTIONS);
    const fileLoggerOptions = Object.assign(defaultOptions, options);
    const fileTransportOptions = Object.assign(defaultOptions.fileOptions, fileLoggerOptions.fileOptions);

    if (fileTransportOptions.filename === LoggerService.DEFAULT_FILENAME) {
      fileTransportOptions.filename = `app-%DATE%.log`;
    }

    const transport = new DailyRotateFile(fileTransportOptions);
    return { transport, options: fileLoggerOptions };
  }

  setRequestId(id: string) {
    this.requestId = id;
  }

  getRequestId() {
    return this.requestId;
  }

  setContext(ctx: string) {
    this.context = ctx;
  }

  log(msg: any, context?: string) {
    this.info(this.dataToString(msg), context);
  }

  debug(msg: any, context?: string) {
    this.logger.debug(this.dataToString(msg), [{ context, reqId: this.requestId }]);
  }

  info(msg: any, context?: string) {
    this.logger.info(this.dataToString(msg), [{ context, reqId: this.requestId }]);
  }

  warn(msg: any, context?: string) {
    this.logger.warn(this.dataToString(msg), [{ context, reqId: this.requestId }]);
  }

  error(msg: any, trace?: string, context?: string) {
    this.logger.error(this.dataToString(msg), [{ context }]);
    this.logger.error(trace, [{ context, reqId: this.requestId }]);
  }

  private dataToString(msg: any) {
    // Support for Map objects
    if (typeof msg.entries === "function" && typeof msg.forEach === "function") {
      const elements = [];
      msg.forEach((value: any, key: any) => elements.push(`${key}:${value}`));
      return elements;
    } else {
      return msg;
    }
  }

  private defaultFormatter(options: LoggerOptions) {
    const colorize = options.colorize;
    const format = winston.format.printf(info => {
      const level = colorize ? this.colorizeLevel(info.level) : `[${info.level.toUpperCase()}]`.padEnd(7);
      let message = info.message;
      if (typeof info.message === "object") {
          message = JSON.stringify(message, null, 3);
      }
      let reqId: string = "";
      let context: string = "";
      if (info["0"]) {
        const meta = info["0"];
        if (meta.reqId) {
          reqId = colorize ? clc.cyan(`[${meta.reqId}]`) : `[${meta.reqId}]`;
        }

        const ctx = meta.context || this.context || null;
        if (ctx) {
          context = `[${ctx.substr(0, 20)}]`.padEnd(32);
          if (colorize) {
            context = clc.blackBright(context);
          }
        }
      }

      return `${info.timestamp} ${context}${level}${reqId} ${message}`;
    });

    return winston.format.combine(
      winston.format.timestamp({
        format: options.timeFormat,
      }),
      format,
    );
  }

  private colorizeLevel(level: string) {
    let colorFunc: (msg: string) => string;
    switch (level) {
      case "debug":
        colorFunc = (msg) => clc.blue(msg);
        break;
      case "info":
        colorFunc = (msg) => clc.green(msg);
        break;
      case "warn":
        colorFunc = (msg) => clc.yellow(msg);
        break;
      case "error":
        colorFunc = (msg) => clc.red(msg);
        break;
    }

    // 17 because of the color bytes
    return colorFunc(`[${level.toUpperCase()}]`).padEnd(17);
  }
}
