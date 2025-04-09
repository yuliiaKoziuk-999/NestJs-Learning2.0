import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { ListDTO } from './dto/listUsers.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '../auth/enum/role.enum';

@Controller('users') //users
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  /*
  GET /users
  GET /users/:id
  POST /users
  PATCH /users/:id
  */

  @Get() // GET /users or /users?role=value
  async findAll(@Body() body: ListDTO) {
    return this.userService.findAll(body);
  }

  // @Get('search') // GET /users/search?name=value
  // async findNames(@Query('name') name?: string) {
  //   if (!name) {
  //     return `Error 404`;
  //   }
  //   return this.userService.findByName(name);
  // }

  @Get(':id') // GET /users/:id
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne({ id });
  }

  @Post() //POST /users
  @Roles(Role.ADMIN)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id') //PATCH /users/:id
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id') // DELETE /users/:id
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
