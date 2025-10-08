import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MOVIE_TITLE_ALREADY_EXISTS,
  NOT_FOUND_RESOURCE,
} from 'src/common/constants/exception-messages.const';
import { SortDirection } from 'src/common/dtos/page-pagination.dto';
import { removeUndefined } from 'src/common/utils/object';
import {
  CursorPaginateResponse,
  paginateByCursor,
  paginateByPage,
  PaginateResponse,
} from 'src/common/utils/pagination';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async createMovie(params: { title: string }): Promise<Movie> {
    const hasMovie = await this.movieRepository.findOne({
      where: {
        title: params.title,
      },
    });

    if (hasMovie) {
      throw new BadRequestException(MOVIE_TITLE_ALREADY_EXISTS);
    }

    const createdMovie = this.movieRepository.create({
      title: params.title,
    });

    return await this.movieRepository.save(createdMovie);
  }

  async findAllMovies(): Promise<Movie[]> {
    return await this.movieRepository.find({});
  }

  async findMoviesByPage(params: {
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginateResponse<Movie>> {
    const { limit, offset, sortField, sortDirection } = params;

    return await paginateByPage({
      repository: this.movieRepository,
      alias: 'movie',
      limit,
      offset,
      orderBy: {
        field: sortField,
        direction: sortDirection,
      },
    });
  }

  async findMoviesByCursor(params: {
    limit: number;
    cursor?: string;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<CursorPaginateResponse<Movie>> {
    const { limit, cursor, sortField, sortDirection } = params;

    return await paginateByCursor({
      repository: this.movieRepository,
      alias: 'movie',
      limit,
      cursor,
      orderBy: {
        field: sortField,
        direction: sortDirection,
      },
    });
  }

  async getMovieById(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
    });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return movie;
  }

  async updateMovie(id: number, params: { title?: string }) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    const updatedFields = removeUndefined(params);

    if (updatedFields.title) {
      const existingMovie = await this.movieRepository.findOne({
        where: { title: updatedFields.title },
      });

      if (existingMovie && existingMovie.id !== movie.id) {
        throw new BadRequestException(MOVIE_TITLE_ALREADY_EXISTS);
      }
    }

    Object.assign(movie, updatedFields);

    return await this.movieRepository.save(movie);
  }

  async deleteMovie(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
    });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return await this.movieRepository.remove(movie);
  }
}
