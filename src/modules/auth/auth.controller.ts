import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Autorization } from 'src/common/decorators/authorization.decorator';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthContoller {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() dto: RegisterUserDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async loginUser(@Autorization() token: string) {
    return await this.authService.login(token);
  }
}
