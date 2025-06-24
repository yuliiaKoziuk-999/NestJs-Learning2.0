import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ListPostsDto } from './dto/list-post.dto';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiParam,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiCreatedResponse({ description: 'Post created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid data. Post not created' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiBody({ type: CreatePostDto })
  @ApiCreatedResponse({
    description: 'Created post',
  })
  @ApiBadRequestResponse({ description: 'Post didn`t create' })
  async create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    const userId = req[`user`]?.[`sub`]; //TODO CHECK
    return this.postsService.create(createPostDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all posts',
    description: 'Retrieve a list of posts with optional filters.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of posts retrieved successfully.',
  })
  async findAllPosts(@Query() query: ListPostsDto) {
    return this.postsService.findAllPosts(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get post by ID',
    description: 'Retrieve a single post by its ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the post' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update post',
    description: 'Update a post by its ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the post to update',
  })
  @ApiBody({ type: UpdatePostDto, description: 'Post data to update' })
  @ApiResponse({ status: 200, description: 'Post updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete post',
    description: 'Delete a post by its ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the post to delete',
  })
  @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
