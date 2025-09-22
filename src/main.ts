import { LoggerService, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { ApiDocsModule } from './common/api-docs/api-docs.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { EnvKeys } from './configs/env.validation';
import { LogLevel } from './configs/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);

  app.useLogger(logger);
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const env = configService.getOrThrow<string>(EnvKeys.ENV);
  if (env === 'dev') {
    ApiDocsModule.register(app, {
      title: `Example ${env} server`,
      description: 'API Server Docs',
      version: '1.0.0',
    });
  }

  const port = configService.getOrThrow<number>(EnvKeys.PORT);
  await app.listen(port, () => {
    logger.log({
      level: LogLevel.INFO,
      message: `Example ${env} server listening to port ${port}`,
    });
  });
}
bootstrap();
