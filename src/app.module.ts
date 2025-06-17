import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, Reflector } from '@nestjs/core';

import { MyLoggerModule } from './my-logger/my-logger.module';
import { AuthModule } from './auth/auth.module';
import facebookOauthConfig from './config/facebook-oath.config';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import googleOauthConfig from './config/google-oauth.config';
import { MyLoggerService } from './my-logger/my-logger.service';
import { PostsModule } from './posts/posts.module';
import { PrismaService } from './prisma/prisma.service';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { NodemailerModule } from './mailing services/nodemailer/nodemailer.module';
import { TwilioModule } from './verification/twilio.module';
import { RedisService } from './redis/redis.service';
import { RolesGuard } from './guards/role/roles.guard';
import { SocketModule } from './socket/socket.module';
import { SocketIoGateway } from './notifications/socket-io.gateway';
import { NativeWebSocketGateway } from './notifications/websocket.gateway';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    SocketModule,
    UsersModule,
    DatabaseModule,
    NodemailerModule,
    EmployeesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [jwtConfig, googleOauthConfig, facebookOauthConfig],
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
    PostsModule,
    CategoriesModule,
    TagsModule,
    TwilioModule,
  ],
  controllers: [AppController],
  providers: [
    SocketIoGateway,
    NativeWebSocketGateway,
    RedisService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: Logger,
      useClass: MyLoggerService,
    },
    Reflector,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [RedisService, SocketIoGateway, NativeWebSocketGateway],
})
export class AppModule {}
