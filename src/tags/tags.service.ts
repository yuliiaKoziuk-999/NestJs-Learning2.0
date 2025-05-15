import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  create(createdData: CreateTagDto) {
    return this.prisma.tag.create({
      data: createdData,
    });
  }

  async findAllTags({
    page,
    limit,
    search,
    filters,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: any;
  } = {}) {
    page = page ? parseInt(page.toString(), 10) : 1;
    limit = limit ? parseInt(limit.toString(), 10) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TagWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (filters) {
      const { name } = filters;
      if (name) where.name = name;
    }

    const tags = await this.prisma.tag.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { posts: true },
    });

    const total = await this.prisma.tag.count({ where });

    return {
      data: tags,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: number) {
    return this.prisma.tag.findUnique({
      where: { id },
      include: { posts: true },
    });
  }

  update(id: number, updatedData: UpdateTagDto) {
    return this.prisma.tag.update({
      where: { id },
      data: updatedData,
    });
  }

  remove(id: number) {
    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
