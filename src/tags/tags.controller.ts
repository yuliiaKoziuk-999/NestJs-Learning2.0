import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ListTagsDto } from './dto/list-tags.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create tag', description: 'Creates a new tag.' })
  @ApiBody({ type: CreateTagDto })
  @ApiResponse({ status: 201, description: 'Tag created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid tag data.' })
  create(@Body() createdData: CreateTagDto) {
    return this.tagsService.create(createdData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tags',
    description: 'Retrieve a paginated list of tags.',
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
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for tag name or fields',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tags retrieved successfully.',
  })
  async findAllTags(@Query() query: ListTagsDto) {
    return this.tagsService.findAllTags(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get tag by ID',
    description: 'Retrieve a single tag by its ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update tag',
    description: 'Update a tag by its ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Tag ID to update' })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({ status: 200, description: 'Tag updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid update data.' })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  update(@Param('id') id: string, @Body() updatedData: UpdateTagDto) {
    return this.tagsService.update(+id, updatedData);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete tag',
    description: 'Delete a tag by its ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Tag ID to delete' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
