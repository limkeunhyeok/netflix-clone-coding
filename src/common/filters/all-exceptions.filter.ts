import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    response.locals.hasError = true; // logging middleware가 res 로그를 출력하지 않도록

    const { originalUrl, method, query, ip, body } = request;
    const userAgent = request.get('user-agent') || ''; // header에서 가져옴

    const logContents = {
      path: originalUrl,
      method,
      ip,
      userAgent,
      requestBody: JSON.stringify(body),
      requestQuery: JSON.stringify(query),
    };

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception && typeof exception === 'object' && 'message' in exception
        ? (exception as Error).message
        : 'Unhandled error occurred.';

    const exceptionCode =
      exception instanceof HttpException
        ? exception.name
        : InternalServerErrorException.name;

    const stack =
      exception && typeof exception === 'object' && 'stack' in exception
        ? String((exception as Error).stack)
        : undefined;

    this.logger.error({
      message,
      ...logContents,
      status,
      stack,
      error: {
        message,
        name: exceptionCode,
        status,
      },
    });

    response.status(status).json({
      status,
      code: exceptionCode,
      message,
      ...(stack && { stack }),
    });
  }
}
