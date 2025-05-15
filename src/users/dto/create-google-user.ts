import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['INTERN', 'ENGINEER', 'ADMIN'])
  role: 'INTERN' | 'ENGINEER' | 'ADMIN';

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  username?: string;
}
