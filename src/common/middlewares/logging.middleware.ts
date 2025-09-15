import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { path, method, ip, query, body } = req;

    this.logger.info({
      path,
      method,
      ip,
      requestBody: body,
      requestQuery: query,
      message: 'A request has arrived.',
    });

    res.on('finish', () => {
      const { statusCode } = res;

      this.logger.info({
        path,
        statusCode,
        method,
        ip,
        requestBody: body,
        requestQuery: query,
        message: 'Send a response.',
      });
    });

    next();
  }
}
