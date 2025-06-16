import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListCategoriesDto } from './dto/listcategories.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../enum/role.enum';
import { RolesGuard } from 'src/guards/role/roles.guard';
import { JwtAuthGuard } from '@/guards/jwt-auth-guard.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles(Role.ADMIN, Role.INTERN)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAllCategories(@Query() query: ListCategoriesDto) {
    return this.categoriesService.findAllCategories(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatedCategory: UpdateCategoryDto) {
    return this.categoriesService.update(+id, updatedCategory);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
