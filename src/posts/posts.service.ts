import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  create(inputData: CreatePostDto) {
    const { title, content, userId, categoryId, tagIds } = inputData;
  }

  findAll() {
    return this.prisma.post.findMany({
      include: { user: true },
    });
  }

  findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  update(id: number, updatedData: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: updatedData,
    });
  }

  remove(id: number) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
