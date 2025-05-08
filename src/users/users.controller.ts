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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '../auth/enum/role.enum';
import { RolesGuard } from 'src/guards/role/roles.guard';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('users') //users
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
