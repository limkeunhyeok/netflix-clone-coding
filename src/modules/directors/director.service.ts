import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NOT_FOUND_RESOURCE } from 'src/common/constants/exception-messages.const';
import { removeUndefined } from 'src/common/utils/object';
import { Repository } from 'typeorm';
import { Director } from './entities/director.entity';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  async createDirector(params: {
    name: string;
    dob: Date;
    nationality: string;
  }): Promise<Director> {
    const { name, dob, nationality } = params;

    const createdDirector = await this.directorRepository.create({
      name,
      dob,
      nationality,
    });
    return await this.directorRepository.save(createdDirector);
  }

  async findAllDirectors(): Promise<Director[]> {
    return await this.directorRepository.find({});
  }

  async getDirectorById(id: number): Promise<Director> {
    const director = await this.directorRepository.findOne({
      where: {
        id,
      },
    });

    if (!director) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return director;
  }

  async updateDirector(
    id: number,
    params: { name?: string; dob?: Date; nationality?: string },
  ): Promise<Director> {
    const director = await this.directorRepository.findOne({ where: { id } });

    if (!director) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    Object.assign(director, removeUndefined(params));

    return await this.directorRepository.save(director);
  }

  async deleteDirector(id: number): Promise<Director> {
    const director = await this.directorRepository.findOne({
      where: {
        id,
      },
    });

    if (!director) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return await this.directorRepository.remove(director);
  }
}
