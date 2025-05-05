import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { compare } from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not Found');
    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id };
  }

  async register(createAuthDto: CreateAuthDto) {
    try {
      const { email, username, password } = createAuthDto;

      // Перевірка, чи існує вже користувач за email
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new Error('Користувач з такою електронною адресою вже існує');
      }

      // Хешування паролю
      const hashedPassword = await bcrypt.hash(password, 10);

      // Формуємо об'єкт CreateUserDto
      const createUserDto: CreateUserDto = {
        name: username,
        email,
        username,
        password: hashedPassword,
        role: 'INTERN', // можна винести в константу або параметризувати
      };

      // Створення користувача
      const user = await this.usersService.create(createUserDto);

      return {
        message: 'Реєстрація успішна',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(`Помилка під час реєстрації: ${error.message}`);
    }
  }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string; id: number }> {
    // Шукаємо користувача по username
    const user = await this.usersService.findOne({ username });

    // Перевіряємо, чи існує користувач і чи співпадають паролі
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Формуємо payload для JWT
    const payload = { sub: user.id, username: user.username, role: user.role };

    const access_token = await this.jwtService.signAsync(payload);

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: process.env.REFRESH_JWT_EXPIRE_IN || '7d',
    });
    return {
      id: user.id,
      access_token,
      refresh_token,
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async signInWithGoogle(googleUser: any) {
    const payload = {
      sub: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('refreshJwt.refreshTokenSecret'),
      expiresIn: this.configService.get('refreshJwt.refreshTokenExpiresIn'),
    });

    return {
      user: payload,
      accessToken,
      refreshToken,
    };
  }
}
