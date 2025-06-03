import { Injectable, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { PaginationDTO } from './dto/pagination.dto';
import { Role } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createEmployeeDto: Prisma.EmployeeCreateInput[]) {
    return this.databaseService.employee.createMany({
      data: createEmployeeDto,
    });
  }

  async findAll(role?: Role, paginationDTO?: PaginationDTO) {
    const page = paginationDTO?.page
      ? parseInt(paginationDTO.page.toString(), 10)
      : 1;
    const limit = paginationDTO?.limit
      ? parseInt(paginationDTO.limit.toString(), 10)
      : 10;

    const skip = (page - 1) * limit;

    const where = role ? { role } : {};

    const employees = await this.databaseService.employee.findMany({
      where,
      skip,
      take: limit,
    });

    const total = await this.databaseService.employee.count({ where });

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    return this.databaseService.employee.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    return this.databaseService.employee.update({
      where: {
        id,
      },
      data: updateEmployeeDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.employee.delete({
      where: {
        id,
      },
    });
  }
}
