import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
  Res,
  SetMetadata,
  Injectable,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { SignInDTO } from '../dto/signIn.dto';
import { AuthGuard } from '../guards/auth.guards';
import { Public } from '../decorators/public.decorator';
import { GoogleAuthGuard } from 'src/guards/google-auth/google-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth-guard.guard';
import { RefreshAuthGuard } from '../guards/refresh-auth.guard';
import { FacebookAuthGuard } from '../guards/facebook-auth/facebook-auth.guard';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

@Controller('auth')
@Injectable()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLoggerService,
  ) {}

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
    this.logger.log(`SignInDTO: ${JSON.stringify(signInDTO)}`);
    return this.authService.signIn(signInDTO.email, signInDTO.password);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return await this.authService.getProfile(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('signout')
  signOut(@Req() req) {
    return this.authService.signOut(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/register')
  googleRegister() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    try {
      const user = await this.authService.findUserByEmail(req.user.email);

      let tokens;
      if (user) {
        tokens = await this.authService.signInWithGoogle(req.user);
      } else {
        tokens = await this.authService.signUpWithGoogle(req.user);
      }

      const { accessToken, refreshToken } = tokens;

      res.redirect(
        `http://localhost:5173/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
      ); //TODO: move to env (REDIRECT_URL=http://localhost:5173)
    } catch (error) {
      res.redirect(
        `http://localhost:5173/auth/error?message=${encodeURIComponent(
          error.message,
        )}`,
      );
    }
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
    const { accessToken, refreshToken } = response;
    res.redirect(
      `http://localhost:5173/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
    ); //TODO: move to env
  }
}
