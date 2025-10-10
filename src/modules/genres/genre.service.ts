import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GENRE_ALREADY_EXISTS,
  NOT_FOUND_RESOURCE,
} from 'src/common/constants/exception-messages.const';
import { removeUndefined } from 'src/common/utils/object';
import { In, Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async createGenre(params: { name: string }): Promise<Genre> {
    const hasGenre = await this.genreRepository.findOne({
      where: {
        name: params.name,
      },
    });

    if (hasGenre) {
      throw new BadRequestException(GENRE_ALREADY_EXISTS);
    }

    const createdGenre = this.genreRepository.create({
      name: params.name,
    });

    return await this.genreRepository.save(createdGenre);
  }

  async findAllGenres(): Promise<Genre[]> {
    return await this.genreRepository.find({});
  }

  async getGenreById(id: number): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: {
        id,
      },
    });

    if (!genre) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return genre;
  }

  async getGenresByNames(names: string[]): Promise<Genre[]> {
    const genres = await this.genreRepository.find({
      where: { name: In(names) },
    });

    const foundNames = genres.map((g) => g.name);
    const missingNames = names.filter((name) => !foundNames.includes(name));

    if (missingNames.length > 0) {
      throw new NotFoundException(
        `Genres not found: ${missingNames.join(', ')}`,
      );
    }

    return genres;
  }

  async updateGenre(
    id: number,
    params: {
      name?: string;
    },
  ): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: {
        id,
      },
    });

    if (!genre) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    const updatedFields = removeUndefined(params);

    if (updatedFields.name) {
      const existingMovie = await this.genreRepository.findOne({
        where: { name: updatedFields.name },
      });

      if (existingMovie && existingMovie.id !== genre.id) {
        throw new BadRequestException(GENRE_ALREADY_EXISTS);
      }
    }

    Object.assign(genre, updatedFields);

    return await this.genreRepository.save(genre);
  }

  async deleteGenre(id: number): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: {
        id,
      },
    });

    if (!genre) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return await this.genreRepository.remove(genre);
  }
}
