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
import { CreateGenreDto } from './dtos/create-genre.dto';
import { UpdateGenreDto } from './dtos/update-genre.dto';
import { Genre } from './entities/genre.entity';
import { GenreService } from './genre.service';

@ApiTags('Genre')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @Roles([Role.ADMIN])
  async create(@Body() dto: CreateGenreDto): Promise<Genre> {
    return await this.genreService.createGenre(dto);
  }

  @Get()
  @Roles([])
  async findAll(): Promise<Genre[]> {
    return await this.genreService.findAllGenres();
  }

  @Get(':id')
  @Roles([])
  async getOneById(@Param('id', ParseIntPipe) id: number): Promise<Genre> {
    return await this.genreService.getGenreById(id);
  }

  @Put(':id')
  @Roles([Role.ADMIN])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGenreDto,
  ): Promise<Genre> {
    return await this.genreService.updateGenre(id, dto);
  }

  @Delete(':id')
  @Roles([Role.ADMIN])
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Genre> {
    return await this.genreService.deleteGenre(id);
  }
}
