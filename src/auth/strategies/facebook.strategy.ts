import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigType } from '@nestjs/config';
import facebookOathConfig from '../config/facebook-oath.config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(facebookOathConfig.KEY)
    private facebookConfiguration: ConfigType<typeof facebookOathConfig>,
    private authService: AuthService,
  ) {
    if (
      !facebookConfiguration.clientID ||
      !facebookConfiguration.clientSecret ||
      !facebookConfiguration.callbackURL
    ) {
      throw new Error('Facebook OAuth config is missing required fields');
    }

    super({
      clientID: facebookConfiguration.clientID,
      clientSecret: facebookConfiguration.clientSecret,
      callbackURL: facebookConfiguration.callbackURL,
      scope: ['email', 'public_profile'],
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
          'Facebook account does not have a public email',
        ),
        false,
      );
    }

    try {
      const user = await this.authService.validateFacebookUser({
        email,
        name: profile.displayName,
        password: '',
        role: 'INTERN',
        username: '',
      });

      return done(null, user);
    } catch (error) {
      console.error('Error validating Facebook user:', error);
      return done(error, false);
    }
  }
}
