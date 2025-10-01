import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NullableType } from 'joi';
import { isNil } from 'lodash';
import { AccessTokenPayload } from 'src/modules/auth/auth.interface';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const UserInToken = createParamDecorator(
  (data: NullableType<keyof AccessTokenPayload>, context: ExecutionContext) => {
    const ctx = context.switchToHttp();

    const request = ctx.getRequest<AuthenticatedRequest>();

    if (isNil(request.user)) {
      return undefined;
    }

    return data ? request.user[data] : request.user;
  },
);
