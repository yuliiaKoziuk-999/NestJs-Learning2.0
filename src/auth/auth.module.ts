import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';
import jwtConfig from './config/jwt.config';
import refreshJwtConfig from './config/refresh-jwt.config';

@Module({
  imports: [
    forwardRef(() => UsersModule),

    // Jwt for access token
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

    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig), // just load it, don't pass to JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
