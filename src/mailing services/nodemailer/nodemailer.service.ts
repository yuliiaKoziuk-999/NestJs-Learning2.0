import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

@Injectable()
export class NodemailerService implements OnModuleInit {
  sendOtpCreated(email: string) {
    throw new Error('Method not implemented.');
  }
  constructor(@InjectQueue('emailQueue') private readonly emailQueue: Queue) {}

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
      return result;
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }

  async sendOtp(to: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.emailQueue.add('sendEmail', {
      to,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });

    return { otp };
  }
}
