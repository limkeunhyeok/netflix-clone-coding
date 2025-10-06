import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isNil } from 'lodash';
import { Role } from '../constants/role.const';
import { Roles } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Roles(): Public
  // Roles([]): 최소 로그인 필요
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>(Roles, context.getHandler());

    if (!roles) {
      return true;
    }

    const ctx = context.switchToHttp();

    const request = ctx.getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!roles.length) {
      return !isNil(user);
    }

    if (isNil(user)) {
      return false;
    }

    return roles.includes(user.role);
  }
}
