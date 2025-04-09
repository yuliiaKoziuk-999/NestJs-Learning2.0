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
import { OptionsDTO } from './options.dto';

export class ListDTO {
  @IsInt()
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @IsOptional()
  limit?: number = 3;

  @IsString()
  @IsOptional()
  search?: string;

  @ValidateNested()
  @Type(() => OrderByDTO)
  @IsOptional()
  orderBy?: OrderByDTO;

  @ValidateNested()
  @Type(() => OptionsDTO)
  @IsOptional()
  options?: OptionsDTO;
}
