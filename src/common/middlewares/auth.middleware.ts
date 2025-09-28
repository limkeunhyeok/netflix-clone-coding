import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AccessTokenPayload } from 'src/modules/auth/auth.interface';
import { AuthService } from 'src/modules/auth/auth.service';
import { MISSING_AUTHORIZATION_HEADER } from '../constants/exception-messages.const';

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException(MISSING_AUTHORIZATION_HEADER);
    }

    const payload = await this.authService.parseBearerToken(rawToken, {
      isRefreshToken: false,
    });

    req.user = payload;

    next();
  }
}
