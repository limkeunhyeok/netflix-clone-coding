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
import { Transactional } from 'typeorm-transactional';
import { DirectorService } from '../directors/director.service';
import { GenreService } from '../genres/genre.service';
import { UserService } from '../users/user.service';
import { MovieDetail } from './entities/movie-detail.entity';
import { MovieUserLike } from './entities/movie-user-like.entity';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    private readonly genreService: GenreService,
    private readonly directorService: DirectorService,
    private readonly userService: UserService,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,
  ) {}

  async createMovie(params: {
    title: string;
    genreNames: string[];
    directorId: number;
    detail: string;
    userId: number;
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

    const createdMovieDetail = await this.movieDetailRepository.save({
      detail: params.detail,
    });

    return await this.movieRepository.save({
      title: params.title,
      genres,
      director,
      detail: {
        id: createdMovieDetail.id,
      },
      creator: {
        id: params.userId,
      },
    });
  }

  async findAllMovies(): Promise<Movie[]> {
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.creator', 'user');
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
        qb.leftJoinAndSelect('movie.genres', 'genres')
          .leftJoinAndSelect('movie.director', 'director')
          .leftJoinAndSelect('movie.detail', 'detail')
          .leftJoinAndSelect('movie.creator', 'user');
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
        qb.leftJoinAndSelect('movie.genres', 'genres')
          .leftJoinAndSelect('movie.director', 'director')
          .leftJoinAndSelect('movie.detail', 'detail')
          .leftJoinAndSelect('movie.creator', 'user');
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
      relations: ['genres', 'director', 'detail', 'creator'],
    });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return movie;
  }

  @Transactional()
  async updateMovie(
    id: number,
    params: {
      title?: string;
      genreNames?: string[];
      directorId?: number;
      detail?: string;
    },
  ): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['genres', 'director', 'detail', 'creator'],
    });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    const { genreNames, directorId, detail, ...rest } = removeUndefined(params);

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

    if (detail) {
      await this.movieDetailRepository.update(
        {
          id: movie.detail.id,
        },
        {
          detail,
        },
      );
    }

    return await this.movieRepository.save(movie);
  }

  @Transactional()
  async deleteMovie(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['genres', 'director', 'detail', 'creator'],
    });

    if (!movie) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    await this.movieRepository.remove(movie);
    await this.movieDetailRepository.delete(movie.detail.id);

    return movie;
  }

  @Transactional()
  async toggleMovieLike(params: {
    movieId: number;
    userId: number;
    isLike: boolean;
  }): Promise<{
    isLike: boolean | null;
  }> {
    const movie = await this.getMovieById(params.movieId);
    const user = await this.userService.getUserById(params.userId);

    const movieUserLike = await this.movieUserLikeRepository.findOne({
      where: {
        movie: {
          id: params.movieId,
        },
        user: {
          id: params.userId,
        },
      },
      relations: ['movie', 'user'],
    });

    if (!movieUserLike) {
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike: params.isLike,
      });

      if (params.isLike) {
        movie.likeCount++;
      } else {
        movie.dislikeCount++;
      }

      await this.movieRepository.save(movie);
      return { isLike: params.isLike };
    }

    if (movieUserLike.isLike === params.isLike) {
      await this.movieUserLikeRepository.delete({ movie, user });

      if (params.isLike) {
        movie.likeCount--;
      } else {
        movie.dislikeCount--;
      }

      await this.movieRepository.save(movie);
      return { isLike: null };
    }

    if (movieUserLike.isLike) {
      movie.likeCount--;
    } else {
      movie.dislikeCount--;
    }

    if (params.isLike) {
      movie.likeCount++;
    } else {
      movie.dislikeCount++;
    }

    movieUserLike.isLike = params.isLike;
    await this.movieUserLikeRepository.save(movieUserLike);

    await this.movieRepository.save(movie);
    return { isLike: params.isLike };
  }
}
