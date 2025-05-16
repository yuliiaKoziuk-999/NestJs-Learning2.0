import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { DatabaseService } from 'src/database/database.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

// Моки для залежностей
const mockUsersService = {};
const mockDatabaseService = {};
const mockMyLoggerService = {};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '60s' },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            // замокай методи, які викликаються в AuthService
            findById: jest.fn(),
            findByEmail: jest.fn(),
            // інші методи
          },
        },
        {
          provide: 'CONFIGURATION(refresh-jwt)',
          useValue: { secret: 'test-refresh-secret', expiresIn: '1d' },
        },
        {
          provide: DatabaseService,
          useValue: {}, // або мок методів
        },
        {
          provide: MyLoggerService,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
