import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { MyLoggerService } from '../my-logger/my-logger.service';
import { mockUsers, mockUser1 } from '../../test/user.mock';
import * as bcrypt from 'bcrypt';
import { Auth } from 'src/entities/auth.entity';
import { User } from 'src/users/entities/user.entity';
import { authenticate } from 'passport';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from 'src/enum/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    create: jest.Mock<any, any, any>;
    findOne: jest.Mock;
    findByEmail: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
      findByEmail: jest.fn(), // додаємо findByEmail тут
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
              return null;
            }),
          },
        },
        {
          provide: 'CONFIGURATION(refresh-jwt)',
          useValue: {
            secret: 'test-refresh-secret',
            expiresIn: '7d',
          },
        },
        {
          provide: DatabaseService,
          useValue: {},
        },
        {
          provide: MyLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const password = 'testPassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const testUser: User = {
        ...mockUser1,
        password: hashedPassword,
      } as User;

      usersService.findByEmail!.mockResolvedValue(testUser);

      const result = await service.validateUser(testUser.email, password);

      expect(result).toBeDefined();
      expect(result.email).toBe(testUser.email);
      expect((result as any).password).toBeUndefined();
    });
    it('should throw UnauthorizedExeption if user not found', async () => {
      usersService.findByEmail?.mockResolvedValue(null);

      await expect(
        service.validateUser('wrong@example.com', 'anyPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      const testUser: User = { ...mockUser1, password: hashedPassword } as User;

      usersService.findByEmail!.mockResolvedValue(testUser);

      await expect(
        service.validateUser(testUser.email, 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createAuthDto = {
        email: `newuser${Date.now()}@gmail.com`,
        username: 'newuser',
        password: 'password',
        roles: [Role.ADMIN],
      };

      // Користувач не існує
      usersService.findByEmail.mockResolvedValue(null);

      // Успішне створення користувача
      const createdUser = {
        id: 1,
        email: createAuthDto.email,
        username: createAuthDto.username,
        roles: createAuthDto.roles,
      };

      usersService.create = jest.fn().mockResolvedValue(createdUser);

      const result = await service.register(createAuthDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        createAuthDto.email,
      );

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createAuthDto.email,
          username: createAuthDto.username,
        }),
      );
      console.log('Register result:', result);

      expect(result).toEqual({
        message: 'Реєстрація успішна',
        user: expect.objectContaining({
          email: createAuthDto.email,
          username: createAuthDto.username,
          // role: 'ADMIN',
        }),
      });
    });

    it('should throw error if user creation fails', async () => {
      const createAuthDto = {
        email: 'fail@example.com',
        username: 'failuser',
        password: 'password123',
        roles: [Role.ADMIN],
      };

      usersService.findByEmail.mockResolvedValue(null);

      usersService.create = jest
        .fn()
        .mockRejectedValue(new Error('DB create failed'));

      await expect(service.register(createAuthDto)).rejects.toThrow(
        'Помилка під час реєстрації: DB create failed',
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const createAuthDto = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123',
        roles: [Role.INTERN],
      };

      // Користувач вже існує
      usersService.findByEmail = jest.fn().mockResolvedValue({ id: 1 });

      await expect(service.register(createAuthDto)).rejects.toThrow(
        'Користувач з такою електронною адресою вже існує',
      );
    });
  });
  afterEach(() => {
    jest.clearAllMocks(); // очищає всі мокані виклики
  });
});
