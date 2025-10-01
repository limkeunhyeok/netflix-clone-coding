import {
  TOKEN_TYPE_ACCESS,
  TOKEN_TYPE_REFRESH,
} from 'src/common/constants/auth.const';
import { Role } from 'src/common/constants/role.const';

export interface BasicCredentials {
  email: string;
  password: string;
}

export interface AccessTokenPayload {
  sub: number; // 사용자 ID
  role: Role; // 사용자 권한
  type: typeof TOKEN_TYPE_ACCESS;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: number; // 사용자 ID
  type: typeof TOKEN_TYPE_REFRESH;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
