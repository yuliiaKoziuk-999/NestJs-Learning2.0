// import { Role } from '@prisma/client';
import { Role } from '../enum/role.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

// pagination.dto.ts
import { IsInt, IsOptional } from 'class-validator';

export class SignInDTO {
  username: string;
  password: string;
  roles: Role[];

  @IsInt()
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @IsOptional()
  limit?: number = 3;
}
