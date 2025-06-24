import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TwilioService } from './twilio.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Twilio')
@Controller('twilio')
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);

  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  @ApiOperation({
    summary: 'Send SMS',
    description: 'Sends an SMS to the specified phone number.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', example: '+380971234567' },
        message: { type: 'string', example: 'Your code is 123456' },
      },
      required: ['phoneNumber', 'message'],
    },
  })
  @ApiResponse({ status: 200, description: 'SMS sent successfully.' })
  async sendSms(@Body() data: { phoneNumber: string; message: string }) {
    return this.twilioService.sendSms(data);
  }

  @Post('status')
  @ApiOperation({
    summary: 'Update SMS status',
    description: 'Updates the status of an SMS message.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        SmsSid: {
          type: 'string',
          example: 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        },
        SmsStatus: { type: 'string', example: 'delivered' },
      },
      required: ['SmsSid', 'SmsStatus'],
    },
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  async updateStatus(@Body() data: { SmsSid: string; SmsStatus: string }) {
    return this.twilioService.updateStatusSms(data);
  }

  @Post('receive')
  @ApiOperation({
    summary: 'Receive SMS',
    description: 'Handles incoming SMS messages from Twilio.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        From: { type: 'string', example: '+380971234567' },
        To: { type: 'string', example: '+1234567890' },
        Body: { type: 'string', example: 'Some reply message' },
        SmsSid: {
          type: 'string',
          example: 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        },
        SmsStatus: { type: 'string', example: 'received' },
      },
      required: ['From', 'To', 'Body', 'SmsSid', 'SmsStatus'],
    },
  })
  @ApiResponse({ status: 200, description: 'SMS received successfully.' })
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
  @ApiOperation({
    summary: 'Send OTP',
    description: 'Sends a one-time password to the user via SMS.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', example: '+380971234567' },
      },
      required: ['phoneNumber'],
    },
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully.' })
  async sendOtp(@Body('phoneNumber') phoneNumber: string) {
    const result = await this.twilioService.sendOtp(phoneNumber);
    return { message: `OTP sent successfully`, otp: result.otp };
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verifies a previously sent OTP.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verification result.' })
  async verifyOtp(@Body() body: VerifyOtpDto): Promise<{ success: boolean }> {
    const isValid = await this.twilioService.verifyOtp(
      body.phoneNumber,
      body.otp,
    );
    return { success: isValid };
  }
}
