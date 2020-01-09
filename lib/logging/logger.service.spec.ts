import { LoggerService } from "./logger.service";
import * as fs from "fs";
import * as rimraf from "rimraf";
import * as moment from "moment";
import { LoggerTransport } from "./logger.interface";

describe("LoggerService", () => {
  let logger: LoggerService;
  let noColorsLogger: LoggerService;
  const filePath = "logs";
  const serviceName = "LoggerLib";
  const noColorService = "NoColorLib";
  const today = moment().format("YYYY-MM-DD");
  const logfile = `${filePath}/${serviceName}-${today}.log`;
  const noColorsLogFile = `${filePath}/${noColorService}-${today}.log`;

  beforeAll(async () => {
    rimraf.sync(filePath);
    logger = new LoggerService(
      "debug",
      LoggerService.getLoggers([LoggerTransport.CONSOLE, LoggerTransport.ROTATE], { serviceName, path: filePath }),
    );
    noColorsLogger = new LoggerService(
      "debug",
      [
        LoggerService.console({ serviceName: noColorService, colorize: true }),
        LoggerService.rotate({ serviceName: noColorService, path: filePath, colorize: false }),
      ],
    );
  });

  describe("log", () => {
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

      noColorsLogger.info(object, "LoggerServiceNoColorTest");
      noColorsLogger.info(map, "LoggerServiceNoColorTest");
      noColorsLogger.log("test log with info level", "LoggerServiceNoColorTest");
      noColorsLogger.warn("test log with warn level", "LoggerServiceNoColorTest");
      noColorsLogger.error("test log with error level", new Error().stack, "LoggerServiceNoColorTest");
      noColorsLogger.setRequestId("abc123");
      noColorsLogger.debug("test log with request id", "LoggerServiceNoColorTest");
      noColorsLogger.debug("test log with long filename", "LoggerServiceNoColorTestWithLongFilename");
      noColorsLogger.setContext("TestContext");
      noColorsLogger.info("test log with predefined context");
      noColorsLogger.info("test log with predefined context overridden", "OverriddenNoColorContext");
      expect(fs.existsSync(noColorsLogFile)).toBe(true);

      setTimeout(() => {
        const log = fs.readFileSync(noColorsLogFile).toString();
        expect(log.split("\n").length).toBe(29);
        done();
      }, 600);
    });
  });
});
