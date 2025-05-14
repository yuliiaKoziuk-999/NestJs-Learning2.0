import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  create(createdData: CreateTagDto) {
    return this.prisma.tag.create({
      data: createdData,
    });
  }

  findAll() {
    return this.prisma.tag.findMany({
      include: { posts: true },
    });
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
