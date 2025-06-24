import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Ip,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Prisma, Role } from '@prisma/client';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { PaginationDTO } from './dto/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@ApiTags('Employees')
@SkipThrottle()
@Controller('/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  private readonly logger = new MyLoggerService(EmployeesController.name);

  @Post()
  @ApiOperation({
    summary: 'Create employees',
    description: 'Creates one or more employees.',
  })
  @ApiBody({
    type: [CreateEmployeeDto],
    description: 'List of employees to create',
  })
  @ApiResponse({ status: 201, description: 'Employees created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createEmployeeDto: Prisma.EmployeeCreateInput[]) {
    return this.employeesService.create(createEmployeeDto);
  }

  @SkipThrottle({ default: false })
  @Get()
  @ApiOperation({
    summary: 'Get all employees',
    description:
      'Retrieves a paginated list of employees. Optional filtering by role.',
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
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    description: 'Filter by role',
  })
  @ApiResponse({
    status: 200,
    description: 'List of employees returned successfully',
  })
  async findAll(
    @Query() paginationDTO: PaginationDTO,
    @Ip() ip: string,
    @Query('role') role?: Role,
  ) {
    return this.employeesService.findAll(role, paginationDTO);
  }

  @Throttle({ short: { ttl: 1000, limit: 1 } })
  @Get(':id')
  @ApiOperation({
    summary: 'Get employee by ID',
    description: 'Retrieves a single employee by their ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee found' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update employee',
    description: 'Updates an existing employee by ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID' })
  @ApiBody({ type: Object }) // Можеш створити окремий UpdateEmployeeDto для кращої документації
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: Prisma.EmployeeUpdateInput,
  ) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete employee',
    description: 'Deletes an employee by ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
