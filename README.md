# Install
```
npm i nest-logger
```

# Usage

Use in your project by creating a logger.module.ts with content like this:

```javascript
import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { LoggerService } from "nest-logger";
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
        const loggers = LoggerService.getLoggers(
          config.logAppenders,
          { serviceName: config.serviceName, path: config.logFilePath, colorize: config.colorize }
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

Then import logger module wherever you need it:

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