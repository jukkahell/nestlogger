import { LoggerService } from "./logger.service";
import { LoggerTransport } from "./logger.interface";
import * as fs from "fs";
import * as rimraf from "rimraf";
import * as moment from "moment";

describe("LoggerService", () => {
  let logger: LoggerService;
  const filePath = "logs";
  const serviceName = "LoggerLib";
  const today = moment().format("YYYY-MM-DD");
  const logfile = `${filePath}/${serviceName}-${today}.log`;

  beforeAll(async () => {
    rimraf.sync(filePath);
    logger = new LoggerService("debug", serviceName, [LoggerTransport.CONSOLE, LoggerTransport.ROTATE], filePath);
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
  });
});
