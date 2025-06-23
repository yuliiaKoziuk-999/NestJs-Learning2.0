import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { title } from 'process';

describe('PostsService', () => {
  let prismaService: PrismaService;
  let postsService: PostsService;

  beforeEach(async () => {
    const prismaMock = {
      post: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should create and return a post', async () => {
    const inputData: CreatePostDto = {
      title: 'About love',
      content: 'article',
      userId: 2,
      categoryId: 2,
      tagId: 1,
    };

    const expectedResult = {
      id: 123,
      ...inputData,
      tag: { id: 1, name: 'Tag name' },
      category: { id: 2, name: 'Category name' },
    };

    (prismaService.post.create as jest.Mock).mockResolvedValue(expectedResult);

    const result = await postsService.create(inputData);

    expect(result).toEqual(expectedResult);
    expect(prismaService.post.create).toHaveBeenCalledWith({
      data: {
        title: inputData.title,
        content: inputData.content,
        userId: inputData.userId,
        categoryId: inputData.categoryId,
        tagId: inputData.tagId,
      },
      include: { tag: true, category: true },
    });
  });

  it('should return all posts', async () => {
    const query: ListPostsDto = {
      page: 1,
      limit: 2,
      search: 'love',
      filters: {
        userId: '5',
        category: '3',
      },
    };
    const exprectedPosts = [
      {
        id: 1,
        title: 'Love story',
        content: 'Second post',
        userId: 5,
        createdAt: new Date(),
      },
    ];

    const exprectedCount = 7;

    (prismaService.post.findMany as jest.Mock).mockResolvedValue(
      exprectedPosts,
    );
    (prismaService.post.count as jest.Mock).mockResolvedValue(exprectedCount);

    const result = await postsService.findAllPosts(query);

    expect(prismaService.post.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: { contains: 'love', mode: 'insensitive' } },
          { content: { contains: 'love', mode: 'insensitive' } },
        ],
        userId: 5,
        category: { id: 3 },
      },
      skip: 0,
      take: 2,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        createdAt: true,
      },
    });

    expect(result).toEqual({
      data: exprectedPosts,
      meta: {
        total: exprectedCount,
        page: 1,
        limit: 2,
        lastPage: Math.ceil(exprectedCount / 2),
      },
    });
  });

  it('should post by id', async () => {
    const postId = 42;

    const expectPost = {
      id: 42,
      title: 'Test post',
      content: 'Some content',
      user: {
        id: 1,
        name: 'Alice',
      },
    };

    (prismaService.post as any).findUnique = jest
      .fn()
      .mockResolvedValue(expectPost);

    const result = await postsService.findOne(postId);

    expect(result).toEqual(expectPost);
    expect(prismaService.post.findUnique).toHaveBeenCalledWith({
      where: { id: postId },
      include: { user: true },
    });
  });

  it('should update post', async () => {
    const postId = 34;
    const updateDto: UpdatePostDto = {
      title: 'Updated Title',
      content: 'Updated content',
      categoryId: 2,
      tagId: 3,
    };

    const updatedPost = {
      id: postId,
      title: updateDto.title,
      content: updateDto.content,
      categoryId: updateDto.categoryId,
      tagId: updateDto.tagId,
      category: updateDto.categoryId,
      tag: { id: 3, name: 'JS' },
    };

    (prismaService.post.update as jest.Mock).mockResolvedValue(updatedPost);
    const result = await postsService.update(postId, updateDto);

    expect(prismaService.post.update).toHaveBeenCalledWith({
      where: { id: postId },
      data: {
        title: updateDto.title,
        content: updateDto.content,
        categoryId: updateDto.categoryId,
        tagId: updateDto.tagId,
      },
      include: { tag: true, category: true },
    });

    expect(result).toEqual(updatedPost);
  });

  it('should remove post', async () => {
    const postId = 1;

    const deletedPost = {
      id: postId,
      title: 'Delet post',
      content: 'Some content',
      categoryId: 2,
      tagId: 3,
    };

    (prismaService.post.delete as jest.Mock).mockResolvedValue(deletedPost);

    const result = await postsService.remove(postId);

    expect(prismaService.post.delete).toHaveBeenCalledWith({
      where: { id: postId },
    });

    expect(result).toEqual(deletedPost);
  });
});
