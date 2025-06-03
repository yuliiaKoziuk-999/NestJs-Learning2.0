import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import { DatabaseService } from '../database/database.service';
import { MyLoggerService } from '../my-logger/my-logger.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from '../enum/role.enum';
import registerAs from '../config/refresh-jwt.config'; // приклад нижче
import { ConfigType } from '@nestjs/config';
import refreshJwtConfig from '@/config/refresh-jwt.config';

jest.mock('bcrypt');
jest.mock('argon2');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateHashedRefreshToken: jest.fn(),
            findOrCreateGoogleUser: jest.fn(),
            findOrCreateFacebookUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: registerAs,
          useValue: {
            secret: 'test-secret',
            expiresIn: '1h',
          },
        },

        {
          provide: DatabaseService,
          useValue: {
            employee: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: MyLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: refreshJwtConfig.KEY,
          useValue: {
            secret: 'test-secret',
            expiresIn: '7d',
          } satisfies ConfigType<typeof refreshJwtConfig>,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);

    // Mock bcrypt compare
    (bcrypt.compare as jest.Mock).mockImplementation((plain, hashed) => {
      return Promise.resolve(
        plain === 'correct-password' && hashed === 'hashed-password',
      );
    });

    // Mock bcrypt hash
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-value');

    // Mock argon2 verify
    (argon2.verify as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.validateUser(
        'test@example.com',
        'correct-password',
      );
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createAuthDto = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        roles: [Role.INTERN],
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue({
        id: 2,
        email: 'new@example.com',
        username: 'newuser',
        roles: [Role.INTERN],
      });

      const result = await authService.register(createAuthDto);
      expect(result).toEqual({
        message: 'Реєстрація успішна',
        user: {
          id: 2,
          email: 'new@example.com',
          username: 'newuser',
          roles: [Role.INTERN],
        },
      });
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createAuthDto = {
        email: 'existing@example.com',
        username: 'existing',
        password: 'password123',
        roles: [Role.INTERN],
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      });

      await expect(authService.register(createAuthDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('signIn', () => {
    it('should return tokens for valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashed-password',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.signIn(
        'user@example.com',
        'correct-password',
      );
      expect(result).toEqual({
        id: 1,
        accessToken: 'access-token',
        refresh_token: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.signIn('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        username: 'user',
        password: 'secret',
        role: 'INTERN',
      };

      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getProfile(1);
      expect(result).toEqual({
        id: 1,
        email: 'user@example.com',
        username: 'user',
        role: 'INTERN',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.getProfile(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens and update refresh token', async () => {
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await authService.refreshToken(1);
      expect(result).toEqual({
        id: 1,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(usersService.updateHashedRefreshToken).toHaveBeenCalledWith(
        1,
        'hashed-value',
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should return user ID if refresh token is valid', async () => {
      const mockUser = {
        id: 1,
        hashedRefreshToken: 'hashed-refresh-token',
      };

      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.validateRefreshToken(
        1,
        'valid-refresh-token',
      );
      expect(result).toEqual({ id: 1 });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.validateRefreshToken(999, 'token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const mockUser = {
        id: 1,
        hashedRefreshToken: 'hashed-refresh-token',
      };

      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateRefreshToken(1, 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signOut', () => {
    it('should clear refresh token', async () => {
      await authService.signOut(1);
      expect(usersService.updateHashedRefreshToken).toHaveBeenCalledWith(
        1,
        null,
      );
    });
  });

  describe('validateJwtUser', () => {
    it('should return current user if exists', async () => {
      const mockUser = {
        id: 1,
        role: 'ADMIN',
      };

      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.validateJwtUser(1);
      expect(result).toEqual({
        id: 1,
        role: 'ADMIN',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.validateJwtUser(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('OAuth methods', () => {
    const mockGoogleUser = {
      email: 'google@example.com',
      name: 'Google User',
    };

    const mockFacebookUser = {
      email: 'facebook@example.com',
      name: 'Facebook User',
    };

    describe('signUpWithGoogle', () => {
      it('should create new user and return tokens', async () => {
        (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
        (usersService.findOrCreateGoogleUser as jest.Mock).mockResolvedValue({
          id: 2,
          email: 'google@example.com',
        });
        (jwtService.signAsync as jest.Mock)
          .mockResolvedValueOnce('google-access-token')
          .mockResolvedValueOnce('google-refresh-token');

        const result = await authService.signUpWithGoogle(mockGoogleUser);
        expect(result).toEqual({
          accessToken: 'google-access-token',
          refreshToken: 'google-refresh-token',
        });
      });

      it('should throw ConflictException if user exists', async () => {
        (usersService.findByEmail as jest.Mock).mockResolvedValue({
          id: 1,
          email: 'google@example.com',
        });

        await expect(
          authService.signUpWithGoogle(mockGoogleUser),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe('signInWithGoogle', () => {
      it('should return tokens for existing user', async () => {
        (usersService.findByEmail as jest.Mock).mockResolvedValue({
          id: 1,
          email: 'google@example.com',
        });
        (jwtService.signAsync as jest.Mock)
          .mockResolvedValueOnce('google-access-token')
          .mockResolvedValueOnce('google-refresh-token');

        const result = await authService.signInWithGoogle(mockGoogleUser);
        expect(result).toEqual({
          accessToken: 'google-access-token',
          refreshToken: 'google-refresh-token',
        });
      });

      it('should throw UnauthorizedException if user not registered', async () => {
        (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

        await expect(
          authService.signInWithGoogle(mockGoogleUser),
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('signInWithFacebook', () => {
      it('should return tokens for facebook user', async () => {
        (usersService.findOrCreateFacebookUser as jest.Mock).mockResolvedValue({
          id: 3,
          email: 'facebook@example.com',
        });
        (jwtService.signAsync as jest.Mock)
          .mockResolvedValueOnce('fb-access-token')
          .mockResolvedValueOnce('fb-refresh-token');

        const result = await authService.signInWithFacebook(mockFacebookUser);
        expect(result).toEqual({
          accessToken: 'fb-access-token',
          refreshToken: 'fb-refresh-token',
        });
      });
    });
  });
});
