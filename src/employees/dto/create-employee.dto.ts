// dto/create-employee.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] })
  role: string;

  // Додай інші поля згідно з твоїм Prisma.EmployeeCreateInput
}
