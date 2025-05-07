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
import { CreateGoogleUserDto } from 'src/users/dto/create-google-user';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import * as argon2 from 'argon2';

interface CurrentUser {
  id: number;
  role: string;
}

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

  async refreshToken(userId: number) {
    // Генерація нових токенів
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    // Хешування refreshToken
    const hashedRefreshToken = await argon2.hash(refreshToken);

    // Оновлення хешованого refreshToken у базі даних
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

    // Повернення нових токенів
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    // Створення payload для обох токенів
    const payload: AuthJwtPayload = { sub: userId };

    // Генерація accessToken та refreshToken асинхронно
    const [accessToken, refreshToken] = await Promise.all([
      // Генерація accessToken
      this.jwtService.signAsync(payload),

      // Генерація refreshToken з використанням окремої конфігурації (наприклад, з іншою експірацією)
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Invalid Refresh Token');

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid Refresh Token');

    return { id: userId };
  }

  async signOut(userId: number) {
    await this.userService.updateHashedRefreshToken(userId, null);
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = { id: user.id, role: user.role };
    return currentUser;
  }
  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) return user;

    return await this.usersService.create({
      ...googleUser,
      username: googleUser.username ?? googleUser.email.split('@')[0],
      password: googleUser.password ?? crypto.randomUUID(), // або згенеруй тимчасовий пароль
    });
  }
}
