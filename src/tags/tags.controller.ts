import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ListTagsDto } from './dto/list-tags.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../enum/role.enum';
import { RolesGuard } from 'src/guards/role/roles.guard';
import { JwtAuthGuard } from '@/guards/jwt-auth-guard.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createdData: CreateTagDto) {
    return this.tagsService.create(createdData);
  }

  @Get()
  async findAllTags(@Query() query: ListTagsDto) {
    return this.tagsService.findAllTags(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(+id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatedData: UpdateTagDto) {
    return this.tagsService.update(+id, updatedData);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
