# Install
```
npm i nest-logger
```

# TL;DR

Add this in your logger module's useFactory, inject LoggerService and start logging beautiful log entries.

```javascript
const options: LoggerOptions = {
  fileOptions: {
    filename: `logs/my-service-%DATE%.log`,
  },
  colorize: config.colorize,
};
const loggers = LoggerService.getLoggers(
  [LoggerTransport.CONSOLE, LoggerTransport.ROTATE],
  options,
);

return new LoggerService(
  config.logLevel,
  loggers,
);
```

# Detailed usage examples

Use in your project by creating a logger.module.ts with content like this:

```javascript
import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { LoggerService, LoggerOptions } from "nest-logger";
import { ConfigService } from "../config/config.service";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: LoggerService,
      useFactory: (config: ConfigService) => {
        // getLoggers() is a helper function to get configured console and/or rotate logger transports.
        // It takes takes two parameters:
        // 1: Appenders where to log to: console or rotate or both in array
        //    (eg. [LoggerTransport.CONSOLE, LoggerTransport.ROTATE])
        // 2: Logger options object that contains the following properties:
        //    timeFormat?: winston's time format syntax. Defaults to "HH:mm:ss".
        //    colorize?: whether to colorize the log output. Defaults to true.
        //    consoleOptions?: see Winston's ConsoleTransportOptions interface
        //    fileOptions?: see Winston Daily Rotate File's DailyRotateFile.DailyRotateFileTransportOptions
        const options: LoggerOptions = {
          fileOptions: {
            filename: `${config.logger.path}/${config.serviceName}-%DATE%.log`,
          },
          colorize: config.colorize,
        };
        const loggers = LoggerService.getLoggers(
          config.logAppenders,
          options,
        );
        // LoggerService constructor will take two parameters:
        // 1. Log level: debug, info, warn or error
        // 2. List of logger transport objects.
        return new LoggerService(
          config.logLevel,
          loggers,
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
```

## Overriding transport options per logger
You can do it like this if you want different options for console and file:
```javascript
   const loggers = [
      LoggerService.console({
        timeFormat: "HH:mm",
        consoleOptions: {
          level: "info",
        },
      }),
      LoggerService.rotate({
        colorize: false,
        fileOptions: {
          filename: `${config.logger.path}/${config.serviceName}-%DATE%.log`,
          level: "error",
        },
      }),
   ];
   return new LoggerService(
      config.logger.defaultLevel,
      loggers,
   );
```

## Overriding formatter function

Write a function that returns logform.Format object (it's the same what Winston uses):

```javascript
const customFormatter = (options: LoggerOptions) => {
  const format = winston.format.printf(info => {
    const level = options.colorize ? this.colorizeLevel(info.level) : `[${info.level.toUpperCase()}]`.padEnd(7);
    return `${info.timestamp} ${context}${level}${reqId} ${info.message}`;
  });

  return winston.format.combine(
    winston.format.timestamp({
      format: options.timeFormat,
    }),
    format,
  );
}
```

Pass the formatter function as the third param of LoggerService's constructor
```javascript

return new LoggerService(
  config.logLevel,
  loggers,
  customFormatter
);
```

## Overriding winston logger options

Replace level parameter in the first argument of LoggerService's constructor.  
Note that the transports option will be set from the loggers (second constructor parameter) so there's no use to override those here.
```javascript
const myCustomLevels = {
  levels: {
    info: 0,
    warning: 1,
    error: 2,
    apocalypse: 3
  },
  colors: {
    info: 'blue',
    warning: 'green',
    error: 'yellow',
    apocalypse: 'red'
  }
};
const loggerOptions: winston.LoggerOptions = {
  level: config.logLevel,
  levels: customLevels,
}

return new LoggerService(
  loggerOptions,
  loggers,
  customFormatter
);
```

## Using the logger

Import logger module wherever you need it:

```javascript
...
import { LoggerModule } from "../logging/logger.module";

@Module({
  imports: [
    LoggerModule,
    DBModule,
  ],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
```

And log stuff:
```javascript
import { LoggerService } from "nest-logger";
constructor(private readonly logger: LoggerService) {}

public logStuff() {
  this.logger.debug(`Found ${result.rowCount} items from db`, ItemService.name);
  this.logger.error(`Error while getting items from db`, err.stack, ItemService.name);
}
```

# Release Notes

## 7.0.0
- NestJS 7.6.11 -> 7.6.15
- Merge 1.2.1 -> 2.1.1
- RxJS 6.6.3 -> 7.0.0
- etc. libs to the latest
- Moment only needed in devDependencies

## 6.2.0
- NestJS 7.4.4 -> 7.6.11
- Axios 0.20.0 -> 0.21.1

## 6.1.0
- Pass Winston logger options as an optional constructor parameter for LoggerService
- Pass custom formatter function as an optional constructor parameter for LoggerService
- NestJS 7.0.9 -> 7.4.4
- Moment 2.25.3 -> 2.29.0
- rxjs 6.5.4 -> 6.6.3
- Typescript 3.8.3 -> 4.0.3
- Winston 3.2.1 -> 3.3.3
- Winston Daily Rotate File 4.4.2 -> 4.5.0

## 6.0.0
- NestJS 6.10.14 -> 7.0.9
- Updated other deps to the latest

## 5.0.1
- Nullpointer fix to init loggers without passing any options (credits to OpportunityLiu)

## 5.0.0
- Support for all winston logger options for console and rotate transports

## 4.0.1
- Fixed a bug where default options were overridden after the first transport creation

## 4.0.0
- More configurable way of initializing the logger

   Options can be passed as an object  
   Colors can be disabled/enabled from the options
- RxJs 6.5.2 -> 6.5.4
- Nest 6.10.6 -> 6.10.14
- Winston Daily Rotate File 4.3.0 -> 4.4.1

## 3.0.0
- Log Map objects as key-value-pairs
- Dependency upgrades
- NestJS 6.3.2 -> 6.10.6
- Winston Daily Rotate File 3.9.0 -> 4.3.0
- Typescript 3.5.2 -> 3.7.3

## 2.1.0
- NestJS 6.2.4 -> 6.3.2

## 2.0.0
- Nest 5.6.2 -> 6.2.4
- RxJs 6.4.0 -> 6.5.2
- Winston Daily Rotate File 3.6.0 -> 3.9.0
