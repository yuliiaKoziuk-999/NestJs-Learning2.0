import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { Role } from '../enum/role.enum';

export class SignInDTO {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    isArray: true,
    enum: Role,
    example: [Role.INTERN, Role.ADMIN],
  })
  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  limit?: number = 3;
}
