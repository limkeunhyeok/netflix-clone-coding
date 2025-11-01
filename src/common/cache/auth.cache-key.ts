import { hashKey } from '../utils/cache-key';

export const buildAuthAccessTokenCacheKey = (token: string) =>
  `auth:access-token:${hashKey(token)}`;
