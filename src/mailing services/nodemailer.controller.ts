import { Controller, Get, Query } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';

@Controller('email')
export class EmailController {
  constructor(private readonly mailer: NodemailerService) {}

  @Get('send')
  async sendEmail(
    @Query('to') to: string,
    @Query('subject') subject: string,
    @Query('text') text: string,
  ) {
    return this.mailer.sendMessage(to, subject, text);
  }
}
