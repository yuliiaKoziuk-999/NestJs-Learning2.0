import { Controller, Post, Body, Logger } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { SmsEntity } from './entities/sms.entity';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('twilio')
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);

  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  async sendSms(@Body() data: { phoneNumber: string; message: string }) {
    return this.twilioService.sendSms(data);
  }

  @Post('status')
  async updateStatus(@Body() data: { SmsSid: string; SmsStatus: string }) {
    return this.twilioService.updateStatusSms(data);
  }

  @Post('receive')
  async receiveSms(
    @Body()
    data: {
      From: string;
      To: string;
      Body: string;
      SmsSid: string;
      SmsStatus: string;
    },
  ) {
    return this.twilioService.receiveSms(data);
  }

  @Post('otp')
  async sendOtp(@Body('phoneNumber') phoneNumber: string) {
    const result = await this.twilioService.sendOtp(phoneNumber);
    return { message: `OTP sent successfully`, otp: result.otp };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto): Promise<{ success: boolean }> {
    const isValid = await this.twilioService.verifyOtp(
      body.phoneNumber,
      body.otp,
    );
    return { success: isValid };
  }
}
