import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { title } from 'process';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn(),
            findAllPosts: jest.fn(),
            count: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should call create method and return the result', async () => {
      const createPostDto: CreatePostDto = {
        title: 'New Post',
        content: 'Some Content',
        categoryId: 1,
        tagId: 2,
        userId: 1,
      };

      const createdPost = {
        id: 1,
        ...createPostDto,
      };
      (postsService.create as jest.Mock).mockResolvedValue(createdPost);

      const result = await controller.create(createPostDto);
      expect(postsService.create).toHaveBeenCalledWith(createPostDto);
      expect(result).toEqual(createdPost);
    });
  });

  describe('findAllPosts', () => {
    it('should call findAllPosts method', async () => {
      const query: ListPostsDto = { page: 1, limit: 10 };
      const mockData = [
        { id: 1, title: 'Post1' },
        { id: 2, title: 'Post2' },
      ];
      (postsService.findAllPosts as jest.Mock).mockResolvedValue(mockData);

      const result = await controller.findAllPosts(query);

      expect(postsService.findAllPosts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockData);
    });
  });

  describe('findOne', () => {
    it('should call findOne method with the correct id and return the post', async () => {
      const postId = '1';
      const mockPost = { id: 1, title: 'Test Post' };

      (postsService.findOne as jest.Mock).mockResolvedValue(mockPost);

      const result = await controller.findOne(postId);
      expect(postsService.findOne).toHaveBeenCalledWith(1);

      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should call update method with correct id and dto', async () => {
      const postId = '1';
      const updatedDto: UpdatePostDto = {
        title: 'Updated Title',
        content: 'Updated content',
        categoryId: 2,
        tagId: 3,
      };

      const updatedPost = { id: 1, ...updatedDto };

      (postsService.update as jest.Mock).mockResolvedValue(updatedPost);

      const result = await controller.update(postId, updatedDto);
      expect(postsService.update).toHaveBeenCalledWith(1, updatedDto);
      expect(result).toEqual(updatedPost);
    });
  });

  describe('remove', () => {
    it('should call remove method with the correct id and return the deleted post', async () => {
      const postId = '1';
      const deletedPost = { id: 1, title: 'Deleted Post' };

      (postsService.remove as jest.Mock).mockResolvedValue(deletedPost);

      const result = await controller.remove(postId);
      expect(postsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deletedPost);
    });
  });
});
