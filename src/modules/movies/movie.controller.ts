import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/constants/role.const';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  CursorPaginateResponse,
  PaginateResponse,
} from 'src/common/utils/pagination';
import { CreateMovieDto } from './dtos/create-movie.dto';
import { FindMoviesByCursorDto } from './dtos/find-movies-by-cursor.dto';
import { FindMoviesByPagedDto } from './dtos/find-movies-by-paged.dto';
import { UpdateMovieDto } from './dtos/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { MovieService } from './movie.service';

@ApiTags('Movie')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @Roles([Role.ADMIN])
  async create(@Body() dto: CreateMovieDto): Promise<Movie> {
    return await this.movieService.createMovie(dto);
  }

  @Get()
  @Roles([])
  async findAll(): Promise<Movie[]> {
    return await this.movieService.findAllMovies();
  }

  @Get('paged')
  @Roles([])
  async findAllByPage(
    @Query() dto: FindMoviesByPagedDto,
  ): Promise<PaginateResponse<Movie>> {
    return await this.movieService.findMoviesByPage(dto);
  }

  @Get('cursor')
  @Roles([])
  async findAllByCursor(
    @Query() dto: FindMoviesByCursorDto,
  ): Promise<CursorPaginateResponse<Movie>> {
    return await this.movieService.findMoviesByCursor(dto);
  }

  @Get(':id')
  @Roles([])
  async getOneById(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return await this.movieService.getMovieById(id);
  }

  @Put(':id')
  @Roles([Role.ADMIN])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovieDto,
  ): Promise<Movie> {
    return await this.movieService.updateMovie(id, dto);
  }

  @Delete(':id')
  @Roles([Role.ADMIN])
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return await this.movieService.deleteMovie(id);
  }
}
