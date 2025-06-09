import { IsString, IsPhoneNumber } from 'class-validator';

export class VerifyOtpDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  otp: string;
}
