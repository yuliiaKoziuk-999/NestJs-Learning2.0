import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { access } from 'fs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  databaseService: any;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    // Шукаємо користувача по username
    const user = await this.usersService.findOne({ username });

    // Перевіряємо, чи існує користувач і чи співпадають паролі
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Формуємо payload для JWT
    const payload = { sub: user.id, username: user.username, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getProfile(userId: number) {
    // Отримуємо користувача з бази
    const user = await this.databaseService.employee.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { pass, ...safeUser } = user;

    return safeUser;
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number, username: string) {
    return this.databaseService.employee.findUnique({
      where: {
        id,
        username,
      },
    });
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
