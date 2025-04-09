import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

// pagination.dto.ts
import { IsInt, IsOptional } from 'class-validator';
import { OrderByDTO } from './orderBy.dto';
import { Type } from 'class-transformer';

export class OptionsDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  role?: string;
}
