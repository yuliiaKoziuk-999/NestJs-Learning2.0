// posts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostsModule } from './posts.module';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PostsModule],
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              // та інші методи, які використовуються
            },
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
