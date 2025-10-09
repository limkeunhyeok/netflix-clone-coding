import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';
import { envValidationSchema } from './configs/env.validation';
import { TypeormConfigService } from './configs/typeorm.config';
import { WinstonConfigService } from './configs/winston.config';
import { AuthModule } from './modules/auth/auth.module';
import { GenreModule } from './modules/genres/genre.module';
import { MovieModule } from './modules/movies/movie.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfigService,
    }),
    WinstonModule.forRootAsync({
      useClass: WinstonConfigService,
    }),
    UserModule,
    AuthModule,
    MovieModule,
    GenreModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply(AuthMiddleware)
      .exclude(
        {
          path: '/auth/login',
          method: RequestMethod.POST,
        },
        {
          path: '/auth/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
