import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
// import { MyLoggerModule } from './my-logger/my-logger.module';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { AuthModule } from './auth/auth.module';
import googleOauthConfig from './auth/config/google-oauth.config';
import facebookOauthConfig from './auth/config/facebook-oath.config';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './auth/config/jwt.config';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    EmployeesModule,
    ConfigModule.forRoot({
      isGlobal: true, // щоб конфігурація була доступна у всіх модулях
      envFilePath: '.env', // явно вказуємо файл .env
      load: [jwtConfig, googleOauthConfig, facebookOauthConfig], // завантажуємо конфігурацію googleOauthConfig
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    MyLoggerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
