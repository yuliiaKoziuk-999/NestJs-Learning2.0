import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { MailService } from '@sendgrid/mail';
import { NodemailerService } from './nodemailer.service';
import { QueueService } from '../queue/queue.service';

@Controller('email')
export class NodemailerController {
  constructor(
    private readonly mailService: NodemailerService,
    private readonly queueService: QueueService,
  ) {}

  @Get('send')
  async sendEmail(
    @Query('to') to: string,
    @Query('subject') subject: string,
    @Query('text') text: string,
  ) {
    return this.mailService.sendMessage(to, subject, text);
  }

  @Get('otp')
  async sendOtp(
    @Query('to') to: string,
    @Query('subject') subject: string,
    @Query('text') text: string,
  ) {
    return this.mailService.sendOtp(to);
  }

  @Post('bulk')
  async sendBulk(
    @Body() body: { emails: { to: string; subject: string; text: string }[] },
  ) {
    await this.queueService.sendBulkEmails(body.emails);
    return { message: 'Emails queued successfully' };
  }
}
