// src/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { PostsController } from '../posts/posts.controller';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
