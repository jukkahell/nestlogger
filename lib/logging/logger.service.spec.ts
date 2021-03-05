import { LoggerService } from "./logger.service";
import * as fs from "fs";
import * as rimraf from "rimraf";
import * as moment from "moment";
import { LoggerTransport } from "./logger.interface";

describe("LoggerService", () => {
  let logger: LoggerService;
  let noColorsLogger: LoggerService;
  let overrideLevelLogger: LoggerService;
  const filePath = "logs";
  const serviceName = "LoggerLib";
  const noColorService = "NoColor";
  const overrideService = "Override";
  const today = moment().format("YYYY-MM-DD");
  const overriddenToday = moment().format("YYYYMMDD");
  const logfile = `${filePath}/${serviceName}-${today}.log`;
  const noColorsLogFile = `${filePath}/${noColorService}-${today}.log`;
  const overrideLogFile = `${filePath}/${overrideService}-${overriddenToday}.log`;

  beforeAll(async () => {
    rimraf.sync(filePath);
    logger = new LoggerService(
      "debug",
      LoggerService.getLoggers(
        [LoggerTransport.CONSOLE, LoggerTransport.ROTATE],
        {
          fileOptions: {
            filename: `${filePath}/${serviceName}-%DATE%.log`,
          },
        }),
    );
    noColorsLogger = new LoggerService(
      "debug",
      [
        LoggerService.console({ colorize: true }),
        LoggerService.rotate({
          colorize: false,
          fileOptions: {
            filename: `${filePath}/${noColorService}-%DATE%.log`,
          },
        }),
      ],
    );

    overrideLevelLogger = new LoggerService(
      "debug",
      [
        LoggerService.console({
          colorize: true,
          consoleOptions: {
            level: "info",
          },
        }),
        LoggerService.rotate({
          colorize: false,
          timeFormat: "YYYYMMDD",
          fileOptions: {
            filename: `${filePath}/${overrideService}-%DATE%.log`,
            datePattern: "YYYYMMDD",
            level: "info",
          },
        }),
      ],
    );
  });

  describe("log", () => {
    it("should create transport with no options", () => {
      const consoleTransport = LoggerService.console();
      const rotateTransport = LoggerService.rotate();
      const allTransports = LoggerService.getLoggers([LoggerTransport.CONSOLE, LoggerTransport.ROTATE]);

      expect(consoleTransport).toBeTruthy();
      expect(rotateTransport).toBeTruthy();
      expect(allTransports).toHaveLength(2);
    });

    it("should print log for every level", (done) => {
      const object = {
        message: "This is the message",
        status: "200",
        values: ["foo", "bar", "zap"],
        sub: {
          hero: "He-Man",
        },
      };

      const map = new Map();
      map.set("foo", "bar");

      logger.info(object, "LoggerServiceTest");
      logger.info(map, "LoggerServiceTest");
      logger.log("test log with info level", "LoggerServiceTest");
      logger.warn("test log with warn level", "LoggerServiceTest");
      logger.error("test log with error level", new Error().stack, "LoggerServiceTest");
      logger.setRequestId("abc123");
      logger.debug("test log with request id", "LoggerServiceTest");
      logger.debug("test log with long filename", "LoggerServiceTestWithLongFilename");
      logger.setContext("TestContext");
      logger.info("test log with predefined context");
      logger.info("test log with predefined context overridden", "OverriddenContext");
      expect(fs.existsSync(logfile)).toBe(true);

      setTimeout(() => {
        const log = fs.readFileSync(logfile).toString();
        expect(log.split("\n").length).toBe(30);
        done();
      }, 600);
    });

    it("should print log for every level without colors", (done) => {
      const object = {
        message: "This is the message",
        status: "200",
        values: ["foo", "bar", "zap"],
        sub: {
          hero: "He-Man",
        },
      };

      const map = new Map();
      map.set("foo", "bar");

      noColorsLogger.info(object, "NoColorTest");
      noColorsLogger.info(map, "NoColorTest");
      noColorsLogger.log("test log with info level", "NoColorTest");
      noColorsLogger.warn("test log with warn level", "NoColorTest");
      noColorsLogger.error("test log with error level", new Error().stack, "NoColorTest");
      noColorsLogger.setRequestId("abc123");
      noColorsLogger.debug("test log with request id", "NoColorTest");
      noColorsLogger.debug("test log with long filename", "NoColorTestWithLongFilename");
      noColorsLogger.setContext("TestContext");
      noColorsLogger.info("test log with predefined context");
      noColorsLogger.info("test log with predefined context overridden", "NoColorTest");
      expect(fs.existsSync(noColorsLogFile)).toBe(true);

      setTimeout(() => {
        const log = fs.readFileSync(noColorsLogFile).toString();
        expect(log.split("\n").length).toBe(29);
        expect(log.length).toBe(1358);
        done();
      }, 600);
    });

    it("should log only info level logs", (done) => {
      overrideLevelLogger.debug("Debug level log should not be visible", "OverrideLevel");
      overrideLevelLogger.info("Info level log should be visible", "OverrideLevel");
      expect(fs.existsSync(overrideLogFile)).toBe(true);

      setTimeout(() => {
        const log = fs.readFileSync(overrideLogFile).toString();
        expect(log.replace(/(\r\n|\n|\r)/gm, "")).toBe(`${overriddenToday} [OverrideLevel]                 [INFO]  Info level log should be visible`);
        done();
      }, 600);
    });
  });
});
