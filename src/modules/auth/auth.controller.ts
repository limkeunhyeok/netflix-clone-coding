import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Autorization } from 'src/common/decorators/authorization.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { User } from '../users/entities/user.entity';
import { AuthTokens } from './auth.interface';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterUserDto } from './dtos/register-user.dto';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthContoller {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() dto: RegisterUserDto): Promise<AuthTokens> {
    return await this.authService.register(dto);
  }

  @Post('login')
  async loginUser(@Autorization() token: string): Promise<AuthTokens> {
    return await this.authService.login(token);
  }

  @Get('me')
  async me(@UserInToken('sub') userId: number): Promise<User> {
    return await this.authService.getUserByIdOrFail(userId);
  }

  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return await this.authService.refreshTokens(dto);
  }
}
