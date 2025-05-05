import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ListDTO } from './dto/listUsers.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; // Додаємо для генерації безпечного пароля
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.databaseService.employee.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Якщо користувач автентифікується через Google і пароль не передається
    let hashedPassword = '';

    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    // Якщо username не надано, використовуємо email або генеруємо значення
    const username =
      createUserDto.username || createUserDto.email.split('@')[0]; // Наприклад, email до символу '@'
    const role = createUserDto.role || 'INTERN';

    return this.databaseService.employee.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role,
      },
    });
  }

  async findByEmail(email: string) {
    return this.databaseService.employee.findUnique({
      where: { email },
    });
  }

  // Додаємо цей метод для отримання користувача за ID
  async findById(id: number) {
    return this.databaseService.employee.findUnique({
      where: { id },
    });
  }

  async findAll({ options, page, limit, search }: ListDTO) {
    page = page ? parseInt(page.toString(), 10) : 1;
    limit = limit ? parseInt(limit.toString(), 10) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};

    if (options) {
      const { name, role } = options;
      if (name) where.name = name;
      if (Object.values(Role).includes(role as Role)) {
        where.role = role as Role;
      } else {
        // Якщо роль не належить до enum, можна вибрати за замовчуванням або викинути помилку
        throw new Error('Invalid role provided');
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const employees = await this.databaseService.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
      },
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

  // Оновлений метод findOne
  async findOne({
    id,
    username,
    email,
  }: {
    id?: number;
    username?: string;
    email?: string;
  }) {
    if (!id && !username && !email) {
      throw new UnauthorizedException('No identifier provided');
    }

    let where: Prisma.EmployeeWhereUniqueInput;

    if (id) {
      where = { id };
    } else if (username && typeof username === 'string') {
      where = { username };
    } else if (email && typeof email === 'string') {
      where = { email };
    } else {
      throw new UnauthorizedException('Invalid identifier provided');
    }

    const user = await this.databaseService.employee.findUnique({
      where,
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Метод для створення користувача через Google
  async createFromGoogle(googleUser: any) {
    // Перевіряємо, чи вже існує користувач з таким email
    const existingUser = await this.databaseService.employee.findUnique({
      where: { email: googleUser.email },
    });

    if (existingUser) {
      return existingUser;
    }

    const generatedUsername = googleUser.email.split('@')[0] + Date.now();
    const randomPassword = crypto.randomBytes(16).toString('hex'); // Використовуємо криптографічно безпечний пароль
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    return this.databaseService.employee.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        username: generatedUsername,
        password: hashedPassword,
        role: Role.ENGINEER,
      },
    });
  }

  async update(id: number, updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    return this.databaseService.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async getProfile(userId: number) {
    const user = await this.databaseService.employee.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async remove(id: number) {
    return this.databaseService.employee.delete({
      where: { id },
    });
  }
}
