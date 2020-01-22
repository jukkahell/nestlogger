import * as Transport from "winston-transport";
import DailyRotateFile = require("winston-daily-rotate-file");
import { ConsoleTransportOptions } from "winston/lib/winston/transports";

export enum LoggerTransport {
  CONSOLE = "console",
  ROTATE = "rotate",
}

export type LogLevel = "emerg" | "alert" | "crit" | "error" | "warning" | "notice" | "info" | "debug";

export interface ConfiguredTransport {
  transport: Transport;
  options: LoggerOptions;
}

export interface LoggerOptions {
  timeFormat?: string;
  colorize?: boolean;
  consoleOptions?: ConsoleTransportOptions;
  fileOptions?: DailyRotateFile.DailyRotateFileTransportOptions;
}