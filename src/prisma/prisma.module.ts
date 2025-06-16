import { Global, Module } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { PostsController } from '../posts/posts.controller';
import { PrismaService } from './prisma.service';
import { MyLoggerModule } from '@/my-logger/my-logger.module';

@Global()
@Module({
  imports: [MyLoggerModule],
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
