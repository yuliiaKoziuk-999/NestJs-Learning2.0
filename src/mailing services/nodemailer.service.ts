import { Injectable, OnModuleInit } from '@nestjs/common';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

@Injectable()
export class NodemailerService implements OnModuleInit {
  private transport: Transporter;

  async onModuleInit(): Promise<void> {
    this.transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMessage(to: string, subject: string, text: string) {
    const mailOptions: SendMailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    try {
      const result = await this.transport.sendMail(mailOptions);
      console.log('Email sent:', result.response);
      return result;
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }
}
