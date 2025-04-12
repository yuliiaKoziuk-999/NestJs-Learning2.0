import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Injectable,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignInDTO } from './dto/signIn.dto';
import { AuthGuard } from './auth.guards';
import { Request } from '@nestjs/common';
import { Public } from '../common/public.decorator'; // Імпортуємо декоратор
import { Roles } from './decorators/roles.decorator';
import { Role } from './enum/role.enum';
import { Console } from 'console';
import { console } from 'inspector';
import { IsPublic } from './decorators/isPublicDecorator';

@Controller('auth')
@Injectable()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDTO: SignInDTO) {
    console.log(signInDTO.username);
    console.log(signInDTO.password)
    return this.authService.signIn(signInDTO.username, signInDTO.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // Викликаємо метод з сервісу для отримання профілю без пароля
    return await this.getProfile(req.user.id);
  }

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Public()
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @Param('username') username: string) {
    return {
      sub: id,
      username: username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
