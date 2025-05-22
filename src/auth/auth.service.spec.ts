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
import { UnauthorizedException } from '@nestjs/common';

// describe('AuthService', () => {
//   let authService: AuthService;
//   let usersService: { findOne: jest.Mock; findbByEmail?: jest.Mock };

//   beforeEach(async () => {
//     usersService = {
//       findOne: jest.fn(),
//       findbByEmail: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       imports: [
//         JwtModule.register({
//           secret: 'test-secret',
//           signOptions: { expiresIn: '60s' },
//         }),
//       ],
//       providers: [
//         AuthService,
//         {
//           provide: UsersService,
//           useValue: {
//             findOne: jest.fn(),
//           },
//         },
//         {
//           provide: ConfigService,
//           useValue: {
//             get: jest.fn((key: string) => {
//               if (key === 'JWT_SECRET') return 'test-secret';
//               if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
//               return null;
//             }),
//           },
//         },
//         {
//           provide: 'CONFIGURATION(refresh-jwt)',
//           useValue: {
//             secret: 'test-refresh-secret',
//             expiresIn: '7d',
//           },
//         },
//         {
//           provide: DatabaseService,
//           useValue: {},
//         },
//         {
//           provide: MyLoggerService,
//           useValue: {
//             log: jest.fn(),
//             error: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     authService = module.get<AuthService>(AuthService);
//   });

//   it('should be defined', () => {
//     expect(authService).toBeDefined();
//   });
// });

// describe('validateUser', () => {
//   it('should return user without password if credentials are valid', async () => {
//     const password = 'testPassword';
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const testUser = { ...mockUser1, password: hashedPassword };

//     usersService.findByEmail!.mockResolvedValue(testUser);

//     const result = await authService.validateUser(testUser.email, password);

//     expect(result).toBeDefined();
//     expect(result.email).toBe(testUser.email);
//     expect(result.password).toBeUndefined();
//   });
// });

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findOne: jest.Mock; findByEmail?: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
      findByEmail: jest.fn(), // додаємо findByEmail тут
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
});
