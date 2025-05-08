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
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignInDTO } from './dto/signIn.dto';
import { AuthGuard } from './guards/auth.guards';
import { Request } from '@nestjs/common';
import { Public } from './decorators/public.decorator'; // Імпортуємо декоратор
import { Roles } from './decorators/roles.decorator';
import { Role } from './enum/role.enum';
import { RolesGuard } from '../guards/role/roles.guard';
import { GoogleAuthGuard } from 'src/guards/google-auth/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth-guard.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth/facebook-auth.guard';
import { Console } from 'console';

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

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @SetMetadata('isPublic', true)
  signIn(@Body() signInDTO: SignInDTO) {
    console.log(` SignInDTO ${signInDTO}`);
    return this.authService.signIn(signInDTO.email, signInDTO.password);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
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
}
