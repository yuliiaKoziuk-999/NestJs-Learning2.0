import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { Request } from 'express';
import { log } from 'node:console';
import { console } from 'node:inspector';
import { VerifiedCallback, VerifyCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';

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
    profile: any,
    done: VerifiedCallback,
  ) {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      password: '', // Google OAuth не передає пароль
      role: 'INTERN',
      username: '',
    });

    done(null, user);
  }
}
