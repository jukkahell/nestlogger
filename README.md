Use in your project by creating a logger.module.ts with content like this:

```
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: LoggerService,
      useFactory: (config: ConfigService) => {
        return new LoggerService(config.logLevel, config.serviceName, config.logAppenders, config.logFilePath);
      },
      inject: [ConfigService],
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
```

Then import logger module