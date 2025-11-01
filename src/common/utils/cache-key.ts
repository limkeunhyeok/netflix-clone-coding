import * as crypto from 'crypto';

export function hashKey(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
