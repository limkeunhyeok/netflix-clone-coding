import { IsOptional, IsString } from 'class-validator';
import { PagePaginationDto } from 'src/common/dtos/page-pagination.dto';

export class FindMoviesByPagedDto extends PagePaginationDto {
  @IsOptional()
  @IsString()
  genre?: string;
}
