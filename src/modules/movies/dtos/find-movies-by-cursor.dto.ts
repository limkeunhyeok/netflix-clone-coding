import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/common/dtos/cursor-pagination.dto';

export class FindMoviesByCursorDto extends CursorPaginationDto {
  @IsOptional()
  @IsString()
  genre?: string;
}
