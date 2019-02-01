import { Injectable, NestInterceptor, ExecutionContext, HttpService } from "@nestjs/common";
import { Observable } from "rxjs";
import { LoggerService } from "./logger.service";
import { Request } from "express";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService, private readonly httpService: HttpService) {}
  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const requestId = request.header("x-request-id");
    this.logger.setRequestId(requestId);
    this.httpService.axiosRef.defaults.headers.common["x-request-id"] = requestId;
    return call$;
  }
}