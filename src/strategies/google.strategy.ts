import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { Profile, Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { Request } from 'express';
import { VerifiedCallback } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    if (
      !googleConfiguration.clientID ||
      !googleConfiguration.clientSecret ||
      !googleConfiguration.callbackURL
    ) {
      throw new Error('Google OAuth config is missing required fields');
    }

    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifiedCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(
        new UnauthorizedException(
          'Google account does not have a public email',
        ),
        false,
      );
    }

    try {
      const user = await this.authService.validateGoogleUser({
        email,
        name: profile.displayName,
        password: '',
        role: 'INTERN',
        username: '',
      });

      return done(null, user);
    } catch (error) {
      console.error('Error validating Google user:', error);
      return done(error, false);
    }
  }
}
