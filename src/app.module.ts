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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    EmployeesModule,
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forRoot({
      isGlobal: true, // щоб не імпортувати в кожен модуль
      envFilePath: '.env', // за замовчуванням, але краще явно
      load: [googleOauthConfig],
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
    AuthModule, // <-- залишений один раз
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
