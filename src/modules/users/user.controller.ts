import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/constants/role.const';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import {
  CursorPaginateResponse,
  PaginateResponse,
} from 'src/common/utils/pagination';
import { AccessTokenPayload } from '../auth/auth.interface';
import { CreateUserDto } from './dtos/create-user.dto';
import { FindUsersByCursorDto } from './dtos/find-users-by-cursor.dto';
import { FindUsersByPagedDto } from './dtos/find-users-by-paged.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles([Role.ADMIN])
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(dto);
  }

  @Get()
  @Roles([Role.ADMIN])
  async findAll(): Promise<User[]> {
    return await this.userService.findAllUsers();
  }

  @Get('paged')
  @Roles([Role.ADMIN])
  async findAllByPage(
    @Query() dto: FindUsersByPagedDto,
  ): Promise<PaginateResponse<User>> {
    return await this.userService.findUsersByPage(dto);
  }

  @Get('cursor')
  @Roles([Role.ADMIN])
  async findAllByCursor(
    @Query() dto: FindUsersByCursorDto,
  ): Promise<CursorPaginateResponse<User>> {
    return await this.userService.findUsersByCursor(dto);
  }

  @Get(':id')
  @Roles([Role.ADMIN])
  async getOneById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.getUserById(id);
  }

  @Put(':id')
  @Roles([Role.ADMIN, Role.MEMBER])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @UserInToken() payload: AccessTokenPayload,
  ): Promise<User> {
    return await this.userService.updateUser(id, dto, {
      userId: payload.sub,
      role: payload.role,
    });
  }

  @Delete(':id')
  @Roles([Role.ADMIN, Role.MEMBER])
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @UserInToken() payload: AccessTokenPayload,
  ): Promise<User> {
    return await this.userService.deleteUser(id, {
      userId: payload.sub,
      role: payload.role,
    });
  }
}
