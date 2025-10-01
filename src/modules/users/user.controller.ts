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
import {
  CursorPaginateResponse,
  PaginateResponse,
} from 'src/common/utils/pagination';
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
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get('paged')
  async findAllByPage(
    @Query() dto: FindUsersByPagedDto,
  ): Promise<PaginateResponse<User>> {
    return await this.userService.findUsersByPage(dto);
  }

  @Get('cursor')
  async findAllByCursor(
    @Query() dto: FindUsersByCursorDto,
  ): Promise<CursorPaginateResponse<User>> {
    return await this.userService.findUsersByCursor(dto);
  }

  @Get(':id')
  async findOneById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.findOneById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.remove(id);
  }
}
