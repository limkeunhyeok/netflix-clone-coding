import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { AuthContoller } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, JwtModule],
  controllers: [AuthContoller],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
