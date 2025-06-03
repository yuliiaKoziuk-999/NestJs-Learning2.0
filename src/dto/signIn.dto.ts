import { Role } from '../enum/role.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { IsInt, IsOptional } from 'class-validator';

export class SignInDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsInt()
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @IsOptional()
  limit?: number = 3;
}
