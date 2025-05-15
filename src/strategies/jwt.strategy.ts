import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../common/constans';
import { UsersService } from 'src/users/users.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private readonly logger: MyLoggerService,
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
