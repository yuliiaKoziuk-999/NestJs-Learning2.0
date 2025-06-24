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
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserProfileDto } from '@/dto/userProfile.dto';

@ApiTags('Auth')
@Controller('auth')
@Injectable()
export class AuthController {
  postsService: any;
  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLoggerService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('registration')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async registration(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: SignInDTO })
  @ApiOkResponse({
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @SetMetadata('isPublic', true)
  async signIn(@Body() signInDTO: SignInDTO): Promise<AuthResponseDto> {
    this.logger.log(`SignInDTO: ${JSON.stringify(signInDTO)}`);

    const tokens = await this.authService.signIn(
      signInDTO.email,
      signInDTO.password,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refresh_token,
      id: tokens.id,
    };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid refresh token' })
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req): Promise<AuthResponseDto> {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'User profile fetched successfully',
    type: UserProfileDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized — missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async getProfile(@Req() req) {
    return await this.authService.getProfile(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('signout')
  @ApiOperation({ summary: 'Sign out user' })
  @ApiOkResponse({ description: 'User signed out successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiNotFoundResponse({ description: 'User not found' })
  signOut(@Req() req) {
    return this.authService.signOut(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/register')
  @ApiOperation({ summary: 'Start Google OAuth registration flow' })
  @ApiOkResponse({ description: 'Redirected to Google OAuth consent screen' })
  @ApiUnauthorizedResponse({ description: 'OAuth authorization failed' })
  googleRegister() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  @ApiOperation({ summary: 'Start Google OAuth login flow' })
  @ApiOkResponse({ description: 'Redirected to Google OAuth consent screen' })
  @ApiUnauthorizedResponse({ description: 'OAuth authorization failed' })
  googleLogin() {}

  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiCreatedResponse({ description: 'Handled Google callback' })
  @ApiBadRequestResponse({ description: 'Callback error' })
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
        `${process.env.REDIRECT_URL}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
      );
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
  @ApiOperation({ summary: 'Start Facebook OAuth login flow' })
  @ApiOkResponse({ description: 'Redirected to Facebook OAuth consent screen' })
  @ApiUnauthorizedResponse({ description: 'OAuth authorization failed' })
  facebookLogin() {}

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  @ApiOperation({ summary: 'Handle Facebook OAuth callback' })
  @ApiCreatedResponse({
    description:
      'User signed in or registered via Facebook. Redirect with tokens.',
  })
  @ApiBadRequestResponse({ description: 'Callback error or missing user info' })
  async facebookCallback(@Req() req, @Res() res) {
    const response = await this.authService.signInWithFacebook(req.user);
    const { accessToken, refreshToken } = response;

    res.redirect(
      `${process.env.REDIRECT_URL}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
    );
  }
}
