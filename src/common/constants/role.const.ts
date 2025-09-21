export const Role = {
  ADMIN: 'admin',
  MEMBER: 'member',
  GUESTS: 'guest',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
