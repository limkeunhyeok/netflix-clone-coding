import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  AuthScheme,
  REFRESH_TOKEN_EXPIRES_IN,
  TOKEN_TYPE_ACCESS,
  TOKEN_TYPE_REFRESH,
} from 'src/common/constants/auth.const';
import {
  INVALID_AUTHORIZATION_HEADER_FORMAT,
  INVALID_BASIC_TOKEN_ENCODING,
  INVALID_BASIC_TOKEN_FORMAT,
  INVALID_CREDENTIALS,
  INVALID_EMAIL_OR_PASSWORD,
  INVALID_OR_MALFORMED_TOKEN,
  TOKEN_EXPIRED,
  TOKEN_TYPE_MISMATCH,
  UNSUPPORTED_AUTHENTICATION_SCHEME,
} from 'src/common/constants/exception-messages.const';
import { Role } from 'src/common/constants/role.const';
import { EnvKeys } from 'src/configs/env.validation';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';
import {
  AccessTokenPayload,
  AuthTokens,
  BasicCredentials,
  RefreshTokenPayload,
} from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  parseBasicToken(rawToken: string): BasicCredentials {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new UnauthorizedException(INVALID_AUTHORIZATION_HEADER_FORMAT);
    }

    const parts = rawToken.split(' ');

    if (parts.length !== 2) {
      throw new UnauthorizedException(INVALID_AUTHORIZATION_HEADER_FORMAT);
    }

    const [scheme, encodedCredentials] = parts;
    if (scheme.toLowerCase() !== AuthScheme.BASIC) {
      throw new UnauthorizedException(UNSUPPORTED_AUTHENTICATION_SCHEME);
    }

    let decoded: string;
    try {
      decoded = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    } catch {
      throw new UnauthorizedException(INVALID_BASIC_TOKEN_ENCODING);
    }

    const credentials = decoded.split(':');
    if (credentials.length !== 2) {
      throw new UnauthorizedException(INVALID_BASIC_TOKEN_FORMAT);
    }

    const [email, password] = credentials;
    return {
      email,
      password,
    };
  }

  async parseBearerToken(rawToken: string): Promise<AccessTokenPayload>;
  async parseBearerToken(
    rawToken: string,
    options: { isRefreshToken: true },
  ): Promise<RefreshTokenPayload>;
  async parseBearerToken(
    rawToken: string,
    options: { isRefreshToken?: false } | undefined,
  ): Promise<AccessTokenPayload>;
  async parseBearerToken(
    rawToken: string,
    options?: { isRefreshToken?: boolean },
  ): Promise<AccessTokenPayload | RefreshTokenPayload> {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new UnauthorizedException(INVALID_AUTHORIZATION_HEADER_FORMAT);
    }

    const parts = rawToken.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedException(INVALID_AUTHORIZATION_HEADER_FORMAT);
    }

    const [bearer, token] = parts;
    if (bearer.toLowerCase() !== AuthScheme.BEARER) {
      throw new UnauthorizedException(INVALID_AUTHORIZATION_HEADER_FORMAT);
    }

    const isRefreshToken = options?.isRefreshToken ?? false;

    try {
      const secret = isRefreshToken
        ? this.configService.getOrThrow<string>(EnvKeys.REFRESH_TOKEN_SECRET)
        : this.configService.getOrThrow<string>(EnvKeys.ACCESS_TOKEN_SECRET);

      const payload = await this.jwtService.verifyAsync<
        AccessTokenPayload | RefreshTokenPayload
      >(token, { secret });

      if (isRefreshToken && payload.type !== 'refresh') {
        throw new UnauthorizedException(TOKEN_TYPE_MISMATCH);
      }

      if (!isRefreshToken && payload.type !== 'access') {
        throw new UnauthorizedException(TOKEN_TYPE_MISMATCH);
      }

      return payload;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(TOKEN_EXPIRED);
      }
      throw new UnauthorizedException(INVALID_OR_MALFORMED_TOKEN);
    }
  }

  async issueToken(
    user: { id: number; role: Role },
    options?: { isRefreshToken?: boolean },
  ): Promise<string> {
    const isRefreshToken = options?.isRefreshToken ?? false;

    const secret = isRefreshToken
      ? this.configService.getOrThrow<string>(EnvKeys.REFRESH_TOKEN_SECRET)
      : this.configService.getOrThrow<string>(EnvKeys.ACCESS_TOKEN_SECRET);

    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? TOKEN_TYPE_REFRESH : TOKEN_TYPE_ACCESS,
      },
      {
        secret,
        expiresIn: isRefreshToken
          ? REFRESH_TOKEN_EXPIRES_IN
          : ACCESS_TOKEN_EXPIRES_IN,
      },
    );
  }

  async authenticate(params: {
    email: string;
    password: string;
  }): Promise<User> {
    const { email, password } = params;

    let user: User;

    try {
      user = await this.userService.findOneByEmail(email);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(INVALID_EMAIL_OR_PASSWORD);
      }
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException(INVALID_EMAIL_OR_PASSWORD);
    }

    return user;
  }

  async login(rawToken: string): Promise<AuthTokens> {
    const params = this.parseBasicToken(rawToken);

    const user = await this.authenticate(params);

    const accessToken = await this.issueToken(user, { isRefreshToken: false });
    const refreshToken = await this.issueToken(user, { isRefreshToken: true });

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthTokens> {
    const user = await this.userService.createUser({
      ...params,
      role: Role.MEMBER,
    });

    const accessToken = await this.issueToken(user, { isRefreshToken: false });
    const refreshToken = await this.issueToken(user, { isRefreshToken: true });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserByIdOrFail(userId: number): Promise<User> {
    try {
      return await this.userService.getUserById(userId);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException(INVALID_CREDENTIALS);
      }
      throw error;
    }
  }

  // refreshToken input에 Bearer 포함해야함
  async refreshTokens(params: { refreshToken: string }): Promise<AuthTokens> {
    const { refreshToken } = params;

    const payload = await this.parseBearerToken(refreshToken, {
      isRefreshToken: true,
    });

    const userId = payload.sub;

    const user = await this.getUserByIdOrFail(userId);

    const accessToken = await this.issueToken(user, { isRefreshToken: false });
    const newRefreshToken = await this.issueToken(user, {
      isRefreshToken: true,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
