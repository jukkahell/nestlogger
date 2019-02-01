import * as clc from "cli-color";
import { format } from "winston";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import { LoggerTransport } from "./logger.interface";

export class LoggerService {

  private logger: winston.Logger;
  private requestId: string;
  private context: string;

  constructor(
    level: string,
    serviceName: string,
    loggers: LoggerTransport[],
    path?: string) {
    const transports = [];
    if (loggers && loggers.indexOf(LoggerTransport.CONSOLE) >= 0) {
      transports.push(new winston.transports.Console());
    }
    if (loggers && loggers.indexOf(LoggerTransport.ROTATE) >= 0) {
      const rotateLogger = new DailyRotateFile({
        filename: `${path}/${serviceName}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: false,
        maxFiles: "10d",
        options: { flags: "a", mode: "0776" },
      });
      transports.push(rotateLogger);
    }

    this.logger = winston.createLogger({
      level,
      format: format.combine(
          format.timestamp(),
          this.getLoggerFormat(),
      ),
      transports,
  });
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
    this.info(msg, context);
  }

  debug(msg: any, context?: string) {
    this.logger.debug(msg, [{ context, reqId: this.requestId }]);
  }

  info(msg: any, context?: string) {
    this.logger.info(msg, [{ context, reqId: this.requestId }]);
  }

  warn(msg: any, context?: string) {
    this.logger.warn(msg, [{ context, reqId: this.requestId }]);
  }

  error(msg: any, trace?: string, context?: string) {
    this.logger.error(msg, [{ context }]);
    this.logger.error(trace, [{ context, reqId: this.requestId }]);
  }

  private getLoggerFormat() {
    return format.printf(info => {
      const level = this.colorizeLevel(info.level);
      let message = info.message;
      if (typeof info.message === "object") {
          message = JSON.stringify(message, null, 3);
      }
      let reqId: string = "";
      let context: string = "";
      if (info["0"]) {
        const meta = info["0"];
        if (meta.reqId) {
          reqId = clc.cyan(`[${meta.reqId}]`);
        }
        const ctx = meta.context || this.context || null;
        if (ctx) {
          context = clc.blackBright(`[${ctx.substr(0, 20)}]`).padEnd(32);
        }
      }

      return `${info.timestamp} ${context}${level}${reqId} ${message}`;
    });
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