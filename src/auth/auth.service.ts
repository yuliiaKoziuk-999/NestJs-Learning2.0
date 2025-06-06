import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import refreshJwtConfig from '@/config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { DatabaseService } from '../database/database.service';
import { MyLoggerService } from '../my-logger/my-logger.service';
import { User } from '../users/entities/user.entity';

interface CurrentUser {
  id: number;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    private databaseService: DatabaseService,
    private readonly logger: MyLoggerService,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not Found');

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      id: user.id,
      email: user.email,
    };
  }

  async register(createAuthDto: CreateAuthDto) {
    try {
      const { email, username, password } = createAuthDto;

      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException(
          'Користувач з такою електронною адресою вже існує',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const createUserDto: CreateUserDto = {
        name: username,
        email,
        username,
        password: hashedPassword,
        role: 'INTERN',
      };

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
    email: string,
    pass: string,
  ): Promise<{ accessToken: string; refresh_token: string; id: number }> {
    const user = await this.usersService.findByEmail(email);
    if (!user?.password || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    return {
      id: user.id,
      accessToken,
      refresh_token: refreshToken,
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

  async signUpWithGoogle(googleUser: any) {
    const existingUser = await this.usersService.findByEmail(googleUser.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.usersService.findOrCreateGoogleUser(googleUser);
    return this.generateTokens(user.id);
  }

  async signInWithGoogle(googleUser: any) {
    const existingUser = await this.usersService.findByEmail(googleUser.email);

    if (existingUser) {
      return this.generateTokens(existingUser.id);
    }

    throw new UnauthorizedException(`User is not registered`);
  }

  async signInWithFacebook(facebookUser: any) {
    const user = await this.usersService.findOrCreateFacebookUser(facebookUser);
    return this.generateTokens(user.id);
  }

  async refreshToken(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );

    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    const hashedAccessToken = await bcrypt.hash(accessToken, 10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.databaseService.employee.update({
      where: { id: userId },
      data: {
        accessToken: hashedAccessToken,
        hashedRefreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return { id: userId };
  }

  async signOut(userId: number) {
    await this.usersService.updateHashedRefreshToken(userId, null);
  }

  async validateJwtUser(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    const currentUser: CurrentUser = { id: user.id, role: user.role };
    return currentUser;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) return user;

    return await this.usersService.create({
      ...googleUser,
      username: googleUser.username ?? googleUser.email.split('@')[0],
      password: crypto.randomUUID(),
      authProvider: 'google',
    });
  }

  async validateFacebookUser(facebookUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(facebookUser.email);
    if (user) return user;

    return await this.usersService.create({
      ...facebookUser,
      username: facebookUser.username ?? facebookUser.email.split('@')[0],
      password: crypto.randomUUID(),
      authProvider: 'facebook',
    });
  }

  async updatedAccessToken(userId: number, accessToken: string) {
    return this.databaseService.employee.update({
      where: { id: userId },
      data: {
        accessToken: accessToken,
      },
    });
  }
}
