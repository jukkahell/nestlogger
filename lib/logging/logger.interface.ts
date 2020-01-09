import * as Transport from "winston-transport";

export enum LoggerTransport {
  CONSOLE = "console",
  ROTATE = "rotate",
}

export interface ConfiguredTransport {
  transport: Transport;
  options: LoggerOptions;
}

export interface LoggerOptions {
  serviceName: string;
  path?: string;
  timeFormat?: string;
  fileDatePattern?: string;
  maxFiles?: string;
  zippedArchive?: boolean;
  colorize?: boolean;
}