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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListDTO } from './dto/listUsers.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '../auth/enum/role.enum';
import { RolesGuard } from 'src/guards/role/roles.guard';
import { AuthGuard } from 'src/auth/auth.guards';

@Controller('users') //users
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  /*
  GET /users
  GET /users/:id
  POST /users
  PATCH /users/:id
  */
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @Get('profile') // GET /users or /users?role=value
  async findAll(@Body() body: ListDTO) {
    return this.userService.findAll(body);
  }

  @Get(':id') // GET /users/:id
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const { password, ...user } = await this.userService.findOne({ id });
    return user;
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

  //ТОБТО ЮЗЕРІВ ВИДАЛЯТИ МОЖЕ ЛИШЕ АДМІН
  // @SetMetadata('role', [Role.ADMIN])
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id') // DELETE /users/:id
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
