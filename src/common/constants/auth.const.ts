export const AuthScheme = {
  BASIC: 'basic',
  BEARER: 'bearer',
} as const;

export const TOKEN_TYPE_REFRESH = 'refresh';
export const TOKEN_TYPE_ACCESS = 'access';

export const ACCESS_TOKEN_EXPIRES_IN = '1h';
export const REFRESH_TOKEN_EXPIRES_IN = '30d';
