import { Body, Injectable, Query, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { PaginationDTO } from './dto/pagination.dto';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidationPipe } from '@nestjs/common';
import { contains } from 'class-validator';
import { ListDTO } from './dto/listUsers.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    // Перевіряємо, чи існує користувач з таким же username
    const existingUser = await this.databaseService.employee.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.databaseService.employee.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  async findAll({ options, page, limit, search }: ListDTO) {
    page = page ? parseInt(page.toString(), 10) : 1;
    limit = limit ? parseInt(limit.toString(), 10) : 10;

    const skip = (page - 1) * limit;
    const where = {};

    if (options) {
      let { name, role } = options;
      console.log(name);

      if (name) {
        where[`name`] = name;
      }

      if (role) {
        where[`role`] = role;
      }
    }

    if (search) {
      where[`OR`] = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    console.log(where);

    const employees = await this.databaseService.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
      //
      select:{
      id: true,
      username: true,
      role: true,
      email: true,

      }
    });

    const total = await this.databaseService.employee.count({ where });

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne({ id, username }: { id?: number; username?: string }) {
  const user = await this.databaseService.employee.findUnique({
      where: {
        id,
        username,
      },
      select: {
        id: true,
        username: true,
        role: true,
        email: true, // Не включаємо пароль
        password: true,
      },
    });

    // Перевіряємо, чи користувач знайдений
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return user;
  }

  async update(id: number, updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    return this.databaseService.employee.update({
      where: {
        id,
      },
      data: updateEmployeeDto,
    });
  }

  async getProfile(userId: number) {
    // Отримуємо користувача з бази
    const user = await this.databaseService.employee.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Видаляємо пароль із користувача
    const { password, ...safeUser } = user;

    // Повертаємо дані без пароля
    return safeUser;
  }

  async remove(id: number) {
    return this.databaseService.employee.delete({
      where: {
        id,
      },
    });
  }
}
