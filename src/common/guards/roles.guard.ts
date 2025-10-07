import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isNil } from 'lodash';
import {
  FORBIDDEN_RESOURCE_MODIFICATION,
  INVALID_CREDENTIALS,
} from '../constants/exception-messages.const';
import { Role } from '../constants/role.const';
import { Roles } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>(Roles, context.getHandler());

    // Roles(): Public
    if (!roles) {
      return true;
    }

    const ctx = context.switchToHttp();

    const request = ctx.getRequest<AuthenticatedRequest>();

    const user = request.user;

    const isLoggedIn = !isNil(user);

    // Roles([]): 최소 로그인 필요
    if (!roles.length && isLoggedIn) {
      return true;
    }

    if (!isLoggedIn) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const hasRole = roles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    return true;
  }
}
