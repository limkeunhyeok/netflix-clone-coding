import * as Joi from 'joi';

export const EnvKeys = {
  env: 'ENV',
  dbType: 'DB_TYPE',
  dbHost: 'DB_HOST',
  dbPort: 'DB_PORT',
  dbUsername: 'DB_USERNAME',
  dbPassword: 'DB_PASSWORD',
  dbDatabase: 'DB_DATABASE',
  hashRounds: 'HASH_ROUNDS',
  accessTokenSecret: 'ACCESS_TOKEN_SECRET',
  refreshTokenSecret: 'REFRESH_TOKEN_SECRET',
};

export const envValidationSchema = {
  ENV: Joi.string().valid('dev', 'prod').required(),
  DB_TYPE: Joi.string().valid('postgres').required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  HASH_ROUNDS: Joi.number().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
};
