import { Global, Module } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { PostsController } from '../posts/posts.controller';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
