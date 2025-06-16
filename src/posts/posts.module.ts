import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MyLoggerService } from '@/my-logger/my-logger.service';
import { MyLoggerModule } from '@/my-logger/my-logger.module';

@Module({
  imports: [PrismaModule, MyLoggerModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
