import { Role } from '../enum/role.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { IsInt, IsOptional } from 'class-validator';
export class CreateAuthDto {
  @IsEmail()
  email: string;

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
