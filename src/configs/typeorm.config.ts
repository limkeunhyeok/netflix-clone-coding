import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { EnvKeys } from './env.validation';

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: this.configService.get<string>(EnvKeys.dbType) as 'postgres',
      host: this.configService.get<string>(EnvKeys.dbHost),
      port: this.configService.get<number>(EnvKeys.dbPort),
      username: this.configService.get<string>(EnvKeys.dbUsername),
      password: this.configService.get<string>(EnvKeys.dbPassword),
      database: this.configService.get<string>(EnvKeys.dbDatabase),
      entities: [],
      synchronize: true,
    };
  }
}
