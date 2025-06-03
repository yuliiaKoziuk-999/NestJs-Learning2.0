import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { MailService } from '@sendgrid/mail';
import { QueueService } from './queue/queue.service';

@Controller('email')
export class NodemailerController {
  constructor(
    private readonly mailer: NodemailerService,
    private readonly mailService: NodemailerService,
    private readonly queueService: QueueService,
  ) {}

  @Get('send')
  async sendEmail(
    @Query('to') to: string,
    @Query('subject') subject: string,
    @Query('text') text: string,
  ) {
    return this.mailer.sendMessage(to, subject, text);
  }

  @Get('otp')
  async sendOtp(
    @Query('to') to: string,
    @Query('subject') subject: string,
    @Query('text') text: string,
  ) {
    return this.mailService.sendOtp(to);
  }
  @Post('otp')
  async sendOtp1(@Body('email') email: string) {
    return this.mailService.sendOtp(email);
  }

  @Post('bulk')
  async sendBulk(
    @Body() body: { emails: { to: string; subject: string; text: string }[] },
  ) {
    await this.queueService.sendBulkEmails(body.emails);
    return { message: 'Emails queued successfully' };
  }
}
