import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/common/constants/role.const';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  name?: string;
}
