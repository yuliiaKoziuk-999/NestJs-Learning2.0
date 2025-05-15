<<<<<<< HEAD
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
  findAll(@Query('role') role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    return this.userService.findAll(role);
  }

  @Get(':id') // GET /users/:id
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post() //POST /users
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id') //PATCH /users/:id
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id') // DELETE /users/:id
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
=======
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
  SetMetadata,
  UseGuards,
  Injectable,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListDTO } from './dto/listUsers.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../enum/role.enum';
import { RolesGuard } from 'src/guards/role/roles.guard';
import { AuthGuard } from 'src/guards/auth.guards';

@Controller('users')
@UseGuards(AuthGuard)
@Injectable()
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @Get('profile')
  async findAll(@Body() body: ListDTO) {
    return this.userService.findAll(body);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const { password, ...user } = await this.userService.findOne({ id });
    return user;
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
>>>>>>> roles
