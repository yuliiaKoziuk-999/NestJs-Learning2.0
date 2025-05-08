import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constans';
import { UsersService } from 'src/users/users.service';
import { ConfigType } from '@nestjs/config';
import type refreshJwtConfigType from '../config/refresh-jwt.config'; // 👈 ключове слово `type`
import refreshJwtConfig from '../config/refresh-jwt.config';
//TODO rename file
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'REFRESH-JWT') {
  constructor(
    private usersService: UsersService,
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfig: ConfigType<typeof refreshJwtConfigType>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log('JWT PAYLOAD:', payload);
    const user = await this.usersService.findOne({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...safeUser } = user ?? {};

    console.log('VALIDATED USER:', safeUser);

    return safeUser;
  }
}
