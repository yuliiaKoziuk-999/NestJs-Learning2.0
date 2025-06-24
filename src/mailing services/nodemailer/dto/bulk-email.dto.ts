import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmailPayloadDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Welcome!' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'This is a test email.' })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class BulkEmailDto {
  @ApiProperty({ type: [EmailPayloadDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailPayloadDto)
  emails: EmailPayloadDto[];
}
