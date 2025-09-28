import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Autorization = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const ctx = context.switchToHttp();

    const request = ctx.getRequest<Request>();

    return request.headers['authorization'];
  },
);
