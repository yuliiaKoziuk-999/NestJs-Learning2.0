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
  Req,
  Res,
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
import { IsPublic } from './decorators/isPublicDecorator';
import { RolesGuard } from '../guards/role/roles.guard';
import { GoogleAuthGuard } from 'src/guards/google-auth/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth-guard.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth/facebook-auth.guard';

@Controller('auth')
@Injectable()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('registration')
  async registration(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDTO: SignInDTO) {
    return this.authService.signIn(signInDTO.username, signInDTO.password);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // Викликаємо метод з сервісу для отримання профілю без пароля
    return await this.authService.getProfile(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('signout')
  signOut(@Req() req) {
    this.authService.signOut(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.signInWithGoogle(req.user);
    const accessToken = response.accessToken;
    const refreshToken = response.refreshToken;

    res.redirect(
      `http://localhost:5173/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
    );
  }

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook/login')
  facebookLogin() {}

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  async facebookCallback(@Req() req, @Res() res) {
    const response = await this.authService.signInWithFacebook(req.user);
    const accessToken = response.accessToken;
    const refreshToken = response.refreshToken;

    res.redirect(
      `http://localhost:5173/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
    );
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
  @UseGuards(AuthGuard, RolesGuard)
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
