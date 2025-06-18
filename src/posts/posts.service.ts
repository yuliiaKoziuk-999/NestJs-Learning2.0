import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ListDTO } from 'src/users/dto/listUsers.dto';
import { ListPostsDto } from './dto/list-post.dto';
import { Prisma } from '@prisma/client';
import { connect } from 'http2';
import { SocketIoGateway } from '../notifications/socket-io.gateway';
import { NativeWebSocketGateway } from '../notifications/websocket.gateway';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly socketIoGateway: SocketIoGateway,
    private readonly nativeWebSocketGateway: NativeWebSocketGateway,
  ) {}

  async create(inputData: CreatePostDto, userId: number) {
    const { title, content, categoryId, tagId } = inputData;

    const createdPost = await this.prisma.post.create({
      data: {
        title,
        content,
        userId,
        categoryId,
        tagId,
      },
      include: { tag: true, category: true },
    });

    const message = `✅ Post "${createdPost.title}" created successfully`;

    // Надсилання через Socket.IO
    this.socketIoGateway.sendPostCreatedNotification(message);

    // Надсилання через WebSocket
    this.nativeWebSocketGateway.sendPostCreatedNotification(message);

    return createdPost;
  }

  async findAllPosts({ page, limit, search, filters }: ListPostsDto) {
    page = page ? parseInt(page.toString(), 10) : 1;
    limit = limit ? parseInt(limit.toString(), 10) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filters) {
      const { userId, category } = filters;

      if (userId) {
        where.userId = Number(userId);
      }

      if (category) {
        where.category = {
          id: Number(category),
        };
      }
    }

    const posts = await this.prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        createdAt: true,
      },
    });

    const total = await this.prisma.post.count({ where });

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findAll() {
    return this.prisma.post.findMany({
      include: { user: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async update(id: number, updatedData: UpdatePostDto) {
    const { title, content, categoryId, tagId } = updatedData;

    return this.prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        categoryId,
        tagId,
      },
      include: { tag: true, category: true },
    });
  }

  async remove(id: number) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
