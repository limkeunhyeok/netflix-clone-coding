import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/common/constants/role.const';
import { PagePaginationDto } from 'src/common/dtos/page-pagination.dto';

export class FindUsersByPagedDto extends PagePaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
