import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MyLoggerModule } from 'src/my-logger/my-logger.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '../strategies/google.strategy';
import jwtConfig from '../config/jwt.config';
import refreshJwtConfig from '../config/refresh-jwt.config';
import facebookOauthConfig from '../config/facebook-oath.config';
import googleOauthConfig from '../config/google-oauth.config';
import { FacebookStrategy } from '../strategies/facebook.strategy';
import { DatabaseModule } from 'src/database/database.module';
import { RefreshtStrategy } from 'src/strategies/refresh.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(facebookOauthConfig),
    ConfigModule.forFeature(googleOauthConfig),
    DatabaseModule,
    MyLoggerModule,

    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtModuleOptions>('jwt');
        if (!jwtConfig) {
          throw new Error('JWT config is not defined');
        }
        return jwtConfig;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    RefreshtStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
