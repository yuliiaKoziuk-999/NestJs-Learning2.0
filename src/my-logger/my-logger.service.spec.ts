import { Test, TestingModule } from '@nestjs/testing';
import { MyLoggerService } from './my-logger.service';
import { MyLoggerModule } from './my-logger.module';

describe('MyLoggerService', () => {
  let service: MyLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MyLoggerModule],
      providers: [MyLoggerService],
    }).compile();

    service = module.get<MyLoggerService>(MyLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
