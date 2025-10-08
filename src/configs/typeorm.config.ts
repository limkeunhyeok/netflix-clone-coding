import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Movie } from 'src/modules/movies/movie.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { EnvKeys } from './env.validation';

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: this.configService.get<string>(EnvKeys.DB_TYPE) as 'postgres',
      host: this.configService.get<string>(EnvKeys.DB_HOST),
      port: this.configService.get<number>(EnvKeys.DB_PORT),
      username: this.configService.get<string>(EnvKeys.DB_USERNAME),
      password: this.configService.get<string>(EnvKeys.DB_PASSWORD),
      database: this.configService.get<string>(EnvKeys.DB_DATABASE),
      entities: [User, Movie],
      synchronize: true,
      logging: true,
    };
  }
}
