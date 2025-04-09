import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

// pagination.dto.ts
import { IsInt, IsOptional } from 'class-validator';

export class PaginationDTO {
  @IsInt()
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @IsOptional()
  limit?: number = 3;
}
