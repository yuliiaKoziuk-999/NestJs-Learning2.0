import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ListCategoriesDto } from './dto/listcategories.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      include: { posts: true },
    });
  }

  async findAllCategories(params: ListCategoriesDto = {}) {
    const page = params.page ? parseInt(params.page.toString(), 10) : 1;
    console.log(params);
    const limit = params.limit ? parseInt(params.limit.toString(), 10) : 10;
    console.log(params);
    const search = params.search || '';
    console.log(params);
    const skip = (page - 1) * limit;
    console.log(params);

    const where: Prisma.CategoryWhereInput = {};

    console.log(params);
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const categories = await this.prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    });

    const total = await this.prisma.category.count({ where });

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { posts: true },
    });
  }

  update(id: number, updatedData: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updatedData,
    });
  }

  remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
