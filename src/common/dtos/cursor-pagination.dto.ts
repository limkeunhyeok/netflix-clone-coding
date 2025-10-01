import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { SortDirection } from './page-pagination.dto';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsString()
  @IsOptional()
  sortField: string = 'createdAt';

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.DESC;

  @IsInt()
  @IsOptional()
  limit: number = 5;
}
