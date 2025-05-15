import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../common/constans';
import { UsersService } from 'src/users/users.service';
import { ConfigType } from '@nestjs/config';
import type refreshJwtConfigType from '../config/refresh-jwt.config';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

@Injectable()
export class RefreshtStrategy extends PassportStrategy(
  Strategy,
  'REFRESH-JWT',
) {
  constructor(
    private usersService: UsersService,
    private readonly logger: MyLoggerService,
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
    this.logger.log('JWT PAYLOAD:', payload);
    const user = await this.usersService.findOne({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...safeUser } = user ?? {};

    this.logger.log('VALIDATED USER:' + JSON.stringify(safeUser));

    return safeUser;
  }
}
