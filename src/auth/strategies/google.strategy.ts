import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { Profile, Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { VerifiedCallback } from 'passport-jwt';

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

    // Перевірка наявності публічного email
    if (!email) {
      return done(
        new UnauthorizedException(
          'Google account does not have a public email',
        ),
        false,
      );
    }

    try {
      // Перевірка користувача у системі
      const user = await this.authService.validateGoogleUser({
        email,
        name: profile.displayName,
        password: '', // Можливо, варто уточнити, чому пароль порожній
        role: 'INTERN',
        username: '',
      });

      return done(null, user);
    } catch (error) {
      // Логування помилок
      console.error('Error validating Google user:', error);
      return done(error, false);
    }
  }
}
