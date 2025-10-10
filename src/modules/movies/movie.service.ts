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
import { GenreService } from '../genres/genre.service';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly genreService: GenreService,
  ) {}

  async createMovie(params: {
    title: string;
    genreNames: string[];
  }): Promise<Movie> {
    const genres = await this.genreService.getGenresByNames(params.genreNames);

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
      genres,
    });

    return await this.movieRepository.save(createdMovie);
  }

  async findAllMovies(): Promise<Movie[]> {
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genres');

    return await qb.getMany();
  }

  async findMoviesByPage(params: {
    genre?: string;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginateResponse<Movie>> {
    const { genre, limit, offset, sortField, sortDirection } = params;

    return await paginateByPage({
      repository: this.movieRepository,
      alias: 'movie',
      joins: (qb) => {
        qb.leftJoinAndSelect('movie.genres', 'genres');
      },
      where: (qb) => {
        if (genre) {
          qb.andWhere('genres.name = :genre', { genre });
        }
      },
      limit,
      offset,
      orderBy: {
        field: sortField,
        direction: sortDirection,
      },
    });
  }

  async findMoviesByCursor(params: {
    genre?: string;
    limit: number;
    cursor?: string;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<CursorPaginateResponse<Movie>> {
    const { genre, limit, cursor, sortField, sortDirection } = params;

    return await paginateByCursor({
      repository: this.movieRepository,
      alias: 'movie',
      joins: (qb) => {
        qb.leftJoinAndSelect('movie.genres', 'genres');
      },
      where: (qb) => {
        if (genre) {
          qb.andWhere('genres.name = :genre', { genre });
        }
      },
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

  async updateMovie(
    id: number,
    params: { title?: string; genreNames?: string[] },
  ) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    const { genreNames, ...rest } = removeUndefined(params);

    if (rest.title) {
      const existingMovie = await this.movieRepository.findOne({
        where: { title: rest.title },
      });

      if (existingMovie && existingMovie.id !== movie.id) {
        throw new BadRequestException(MOVIE_TITLE_ALREADY_EXISTS);
      }
    }

    Object.assign(movie, rest);

    if (params.genreNames) {
      const genres = await this.genreService.getGenresByNames(
        params.genreNames,
      );
      movie.genres = genres;
    }

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
