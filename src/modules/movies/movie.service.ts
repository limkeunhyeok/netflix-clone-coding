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
import { DirectorService } from '../directors/director.service';
import { GenreService } from '../genres/genre.service';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly genreService: GenreService,
    private readonly directorService: DirectorService,
  ) {}

  async createMovie(params: {
    title: string;
    genreNames: string[];
    directorId: number;
  }): Promise<Movie> {
    const genres = await this.genreService.getGenresByNames(params.genreNames);
    const director = await this.directorService.getDirectorById(
      params.directorId,
    );

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
      director,
    });

    return await this.movieRepository.save(createdMovie);
  }

  async findAllMovies(): Promise<Movie[]> {
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.director', 'director');

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
        qb.leftJoinAndSelect('movie.genres', 'genres').leftJoinAndSelect(
          'movie.director',
          'director',
        );
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
        qb.leftJoinAndSelect('movie.genres', 'genres').leftJoinAndSelect(
          'movie.director',
          'director',
        );
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
      relations: ['genres', 'director'],
    });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return movie;
  }

  async updateMovie(
    id: number,
    params: { title?: string; genreNames?: string[]; directorId?: number },
  ) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    const { genreNames, directorId, ...rest } = removeUndefined(params);

    if (rest.title) {
      const existingMovie = await this.movieRepository.findOne({
        where: { title: rest.title },
      });

      if (existingMovie && existingMovie.id !== movie.id) {
        throw new BadRequestException(MOVIE_TITLE_ALREADY_EXISTS);
      }
    }

    Object.assign(movie, rest);

    if (genreNames) {
      const genres = await this.genreService.getGenresByNames(genreNames);
      movie.genres = genres;
    }

    if (directorId) {
      const director = await this.directorService.getDirectorById(directorId);
      movie.director = director;
    }

    return await this.movieRepository.save(movie);
  }

  async deleteMovie(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['genres', 'director'],
    });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return await this.movieRepository.remove(movie);
  }
}
