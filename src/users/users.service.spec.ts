import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: (key: string) => 'testValue',
};

const mockDatabaseService = {
  query: jest.fn(),
  find: jest.fn(),
};

const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '60s' },
        }),
        DatabaseModule,
      ],
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: mockDatabaseService }, // клас як токен
        { provide: MyLoggerService, useValue: mockLoggerService }, // клас як токен
        { provide: ConfigService, useValue: mockConfigService }, // якщо ConfigService також клас
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
