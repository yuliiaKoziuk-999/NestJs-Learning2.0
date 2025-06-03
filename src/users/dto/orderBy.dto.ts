import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { IsInt, IsOptional } from 'class-validator';

export class OrderByDTO {
  @IsString()
  @IsOptional()
  direction?: string = 'desc';

  @IsString()
  @IsOptional()
  field?: string = 'name';
}
