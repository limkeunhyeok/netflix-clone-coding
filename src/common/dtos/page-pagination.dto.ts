import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export const SortDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export class PagePaginationDto {
  @IsInt()
  @IsOptional()
  limit: number = 10;

  @IsInt()
  @IsOptional()
  offset: number = 0;

  @IsString()
  @IsOptional()
  sortField: string = 'createdAt';

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.DESC;
}
