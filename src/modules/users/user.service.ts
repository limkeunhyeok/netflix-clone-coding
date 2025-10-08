import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  EMAIL_IS_ALREADY_REGISTERED,
  FORBIDDEN_RESOURCE_MODIFICATION,
  NOT_FOUND_RESOURCE,
} from 'src/common/constants/exception-messages.const';
import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/page-pagination.dto';
import { removeUndefined } from 'src/common/utils/object';
import {
  CursorPaginateResponse,
  paginateByCursor,
  paginateByPage,
  PaginateResponse,
} from 'src/common/utils/pagination';
import { EnvKeys } from 'src/configs/env.validation';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async createUser(params: {
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

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find({});
  }

  async findUsersByPage(params: {
    role?: Role;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginateResponse<User>> {
    const { limit, offset, sortField, sortDirection, role } = params;

    return await paginateByPage({
      repository: this.userRepository,
      alias: 'user',
      limit,
      offset,
      orderBy: {
        field: sortField,
        direction: sortDirection,
      },
      where: (qb) => {
        if (params.role) {
          qb.andWhere('user.role = :role', { role });
        }
      },
    });
  }

  async findUsersByCursor(params: {
    role?: Role;
    limit: number;
    cursor?: string;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<CursorPaginateResponse<User>> {
    const { limit, cursor, sortField, sortDirection, role } = params;

    return await paginateByCursor({
      repository: this.userRepository,
      alias: 'user',
      limit,
      cursor,
      orderBy: {
        field: sortField,
        direction: sortDirection,
      },
      where: (qb) => {
        if (params.role) {
          qb.andWhere('user.role = :role', { role });
        }
      },
    });
  }

  async getUserById(id: number): Promise<User> {
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

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return user;
  }

  async updateUser(
    id: number,
    params: {
      password?: string;
      role?: Role;
    },
    userInToken: {
      userId: number;
      role: Role;
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

    if (userInToken.role !== Role.ADMIN && userInToken.userId !== user.id) {
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
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

  async deleteUser(
    id: number,
    userInToken: {
      userId: number;
      role: Role;
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

    if (userInToken.role !== Role.ADMIN && userInToken.userId !== user.id) {
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    return await this.userRepository.remove(user);
  }
}
