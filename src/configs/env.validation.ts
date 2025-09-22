import * as Joi from 'joi';

export const EnvKeys = {
  ENV: 'ENV',
  PORT: 'PORT',
  DB_TYPE: 'DB_TYPE',
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_USERNAME: 'DB_USERNAME',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_DATABASE: 'DB_DATABASE',
  HASH_ROUNDS: 'HASH_ROUNDS',
  ACCESS_TOKEN_SECRET: 'ACCESS_TOKEN_SECRET',
  REFRESH_TOKEN_SECRET: 'REFRESH_TOKEN_SECRET',
} as const;

export const envValidationSchema = Joi.object({
  ENV: Joi.string().valid('dev', 'prod').required(),
  PORT: Joi.number().required(),
  DB_TYPE: Joi.string().valid('postgres').required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  HASH_ROUNDS: Joi.number().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
});
