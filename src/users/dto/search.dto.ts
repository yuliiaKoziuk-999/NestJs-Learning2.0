import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

import { IsInt, IsOptional } from 'class-validator';
import { OptionsDTO } from './options.dto';
import { Type } from 'class-transformer';
import { OrderByDTO } from './orderBy.dto';
import { ListDTO } from './listUsers.dto';

export class SearchDTO {
  @ValidateNested()
  @Type(() => OptionsDTO)
  @IsOptional()
  options?: OptionsDTO;

  @ValidateNested()
  @Type(() => OptionsDTO)
  @IsOptional()
  name?: ListDTO;
  email?: ListDTO;
  role?: ListDTO;
}
