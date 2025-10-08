import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/common/constants/role.const';
import { CursorPaginationDto } from 'src/common/dtos/cursor-pagination.dto';

export class FindMoviesByCursorDto extends CursorPaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
