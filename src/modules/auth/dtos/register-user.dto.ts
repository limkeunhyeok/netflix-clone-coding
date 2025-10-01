import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
