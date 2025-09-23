import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  EMAIL_IS_ALREADY_REGISTERED,
  NOT_FOUND_RESOURCE,
} from 'src/common/constants/exception-messages.const';
import { Role } from 'src/common/constants/role.const';
import { removeUndefined } from 'src/common/utils/object';
import { EnvKeys } from 'src/configs/env.validation';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(params: {
    email: string;
    password: string;
    role: Role;
    name: string;
  }): Promise<User> {
    const hasUser = await this.userRepository.findOne({
      where: {
        email: params.email,
      },
    });

    if (hasUser) {
      throw new BadRequestException(EMAIL_IS_ALREADY_REGISTERED);
    }

    const hash = await bcrypt.hash(
      params.password,
      this.configService.getOrThrow<number>(EnvKeys.HASH_ROUNDS),
    );

    const createdUser = this.userRepository.create({
      email: params.email,
      password: hash,
      role: params.role,
      name: params.name,
    });
    return await this.userRepository.save(createdUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({});
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return user;
  }

  async update(
    id: number,
    params: {
      password?: string;
      role?: Role;
    },
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    const updatedFields = removeUndefined(params);

    if (updatedFields.password) {
      const hash = await bcrypt.hash(
        updatedFields.password,
        this.configService.getOrThrow<number>(EnvKeys.HASH_ROUNDS),
      );

      updatedFields.password = hash;
    }

    Object.assign(user, updatedFields);

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return await this.userRepository.remove(user);
  }
}
