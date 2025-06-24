import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { MailService } from '@sendgrid/mail';
import { NodemailerService } from './nodemailer.service';
import { QueueService } from '../queue/queue.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BulkEmailDto } from './dto/bulk-email.dto';

@ApiTags('Email')
@Controller('email')
export class NodemailerController {
  constructor(
    private readonly mailService: NodemailerService,
    private readonly queueService: QueueService,
  ) {}

  @Get('send')
  @ApiOperation({
    summary: 'Send email',
    description: 'Sends an email using the Nodemailer service.',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    description: 'Recipient email address',
    type: String,
  })
  @ApiQuery({
    name: 'subject',
    required: true,
    description: 'Email subject',
    type: String,
  })
  @ApiQuery({
    name: 'text',
    required: true,
    description: 'Email message body',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendEmail(
    @Query('to') to: string,
    @Query('subject') subject: string,
    @Query('text') text: string,
  ) {
    return this.mailService.sendMessage(to, subject, text);
  }

  @Get('otp')
  @ApiOperation({
    summary: 'Send OTP',
    description: 'Sends a one-time password (OTP) via email.',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    description: 'Recipient email address',
    type: String,
  })
  @ApiQuery({
    name: 'subject',
    required: false,
    description: 'Email subject (optional)',
    type: String,
  })
  @ApiQuery({
    name: 'text',
    required: false,
    description: 'Email body text (optional)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendOtp(
    @Query('to') to: string,
    @Query('subject') subject: string,
    @Query('text') text: string,
  ) {
    return this.mailService.sendOtp(to);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Send bulk emails',
    description: 'Queues multiple emails for sending via background job.',
  })
  @ApiResponse({ status: 201, description: 'Emails queued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendBulk(@Body() body: BulkEmailDto) {
    await this.queueService.sendBulkEmails(body.emails);
    return { message: 'Emails queued successfully' };
  }
}
