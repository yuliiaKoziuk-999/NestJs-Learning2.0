import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ListDTO } from './dto/listUsers.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

@Injectable()
export class UsersService {
  async updateHashedRefreshToken(
    userId: number,
    hashedRefreshToken: string | null,
  ) {
    await this.databaseService.employee.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly logger: MyLoggerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.databaseService.employee.findFirst({
      where: {
        OR: [
          {
            username:
              createUserDto.username || createUserDto.email.split('@')[0],
          },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      throw new Error('User with this username or email already exists');
    }

    let hashedPassword = '';

    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    let username = createUserDto.username || createUserDto.email.split('@')[0];
    let counter = 1;
    while (
      await this.databaseService.employee.findUnique({ where: { username } })
    ) {
      username = `${createUserDto.email.split('@')[0]}${counter++}`;
    }
    const role = createUserDto.role || 'INTERN';

    const name = createUserDto.name || 'Default Name';

    try {
      return this.databaseService.employee.create({
        data: {
          name,
          username,
          email: createUserDto.email,
          password: hashedPassword,
          role: createUserDto.role || 'INTERN',
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Username already exists, please choose another one.');
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    const user = await this.databaseService.employee.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
        password: true,
      },
    });

    return user;
  }

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

  async findOne({
    id,
    username,
    email,
  }: {
    id?: number;
    username?: string;
    email?: string;
  }) {
    const identifiers = [id, username, email].filter(Boolean);
    if (identifiers.length !== 1) {
      throw new UnauthorizedException(
        'Exactly one identifier must be provided',
      );
    }

    const cleanEmail = email?.trim();
    const cleanUsername = username?.trim();

    let where: Prisma.EmployeeWhereUniqueInput;
    if (id) {
      where = { id };
    } else if (cleanUsername) {
      where = { username: cleanUsername };
    } else if (cleanEmail) {
      where = { email: cleanEmail };
    } else {
      throw new UnauthorizedException('Invalid identifier');
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
      throw new UnauthorizedException('User not FOUND');
    }

    return user;
  }

  async findOrCreateGoogleUser(googleUser: any) {
    const existingUser = await this.findByEmail(googleUser.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    this.logger.log('googleUser in signUpWithGoogle:', googleUser);
    return this.create({
      ...googleUser,
      username: googleUser.username ?? googleUser.email.split('@')[0],
      password: crypto.randomUUID(),
      authProvider: 'google',
    });
  }

  async findOrCreateFacebookUser(facebookUser: any) {
    const existingUser = await this.findByEmail(facebookUser.email);
    if (existingUser) return existingUser;

    return this.create({
      ...facebookUser,
      username: facebookUser.username ?? facebookUser.email.split('@')[0],
      password: crypto.randomUUID(),
      authProvider: 'facebook',
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
