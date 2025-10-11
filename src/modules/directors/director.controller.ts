import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/constants/role.const';
import { Roles } from 'src/common/decorators/roles.decorator';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dtos/create-director.dto';
import { UpdateDirectorDto } from './dtos/update-director.dto';
import { Director } from './entities/director.entity';

@ApiTags('Director')
@Controller('directors')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Post()
  @Roles([Role.ADMIN])
  async create(@Body() dto: CreateDirectorDto): Promise<Director> {
    return await this.directorService.createDirector(dto);
  }

  @Get()
  @Roles([])
  async findAll(): Promise<Director[]> {
    return await this.directorService.findAllDirectors();
  }

  @Get(':id')
  @Roles([])
  async getOneById(@Param('id', ParseIntPipe) id: number): Promise<Director> {
    return await this.directorService.getDirectorById(id);
  }

  @Put(':id')
  @Roles([Role.ADMIN])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDirectorDto,
  ): Promise<Director> {
    return await this.directorService.updateDirector(id, dto);
  }

  @Delete(':id')
  @Roles([Role.ADMIN])
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Director> {
    return await this.directorService.deleteDirector(id);
  }
}
