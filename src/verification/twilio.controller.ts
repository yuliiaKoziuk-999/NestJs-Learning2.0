import { Controller, Post, Body, Logger } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { SmsEntity } from './entities/sms.entity';

@Controller('twilio')
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);

  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  async sendSms(@Body() data: { phoneNumber: string; message: string }) {
    this.logger.log(`Sending SMS to ${data.phoneNumber}`);
    return this.twilioService.sendSms(data);
  }

  @Post('status')
  async updateStatus(@Body() data: { SmsSid: string; SmsStatus: string }) {
    this.logger.log(`Updating status for SID ${data.SmsSid}`);
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
    this.logger.log(`Received SMS from ${data.From}`);
    return this.twilioService.receiveSms(data);
  }

  @Post('otp')
  async sendOtp(@Body('phoneNumber') phoneNumber: string) {
    const result = await this.twilioService.sendOtp(phoneNumber);
    return { message: `OTP sent successfully`, otp: result.otp };
  }
}
