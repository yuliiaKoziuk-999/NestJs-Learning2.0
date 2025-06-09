import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Twilio, Twilio as TwilioClient } from 'twilio';
import { SmsRepository } from '../repository/sms.repository';
import { SmsEntity } from './entities/sms.entity';
import { randomInt } from 'crypto';
import { RedisService } from '@/redis/redis.service';

interface SendSmsInput {
  phoneNumber: string;
  message: string;
}

interface UpdateStatusInput {
  SmsSid: string;
  SmsStatus: string;
}

interface ReceiveSmsInput {
  From: string;
  To: string;
  Body: string;
  SmsSid: string;
  SmsStatus: string;
}

@Injectable()
export class TwilioService implements OnModuleInit {
  private twilio: TwilioClient;
  private readonly logger = new Logger(TwilioService.name);

  constructor(
    private readonly smsRepository: SmsRepository,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID ?? '';
      const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
      this.twilio = new Twilio(accountSid, authToken);
    } catch (error) {
      this.logger.error('Twilio initialization failed:', error);
    }
  }

  async sendSms(data: SendSmsInput): Promise<SmsEntity> {
    const from = process.env.TWILIO_FROM_NUMBER ?? '';

    try {
      const response = await this.twilio.messages.create({
        from,
        to: data.phoneNumber,
        body: data.message,
      });

      return this.smsRepository.create({
        data: {
          to: data.phoneNumber,
          message: data.message,
          from,
          sid: response.sid,
          status: response.status,
        },
      });
    } catch (error) {
      this.logger.error('Failed to send SMS with Twilio:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async updateStatusSms(data: UpdateStatusInput): Promise<number[]> {
    try {
      const updated = await this.smsRepository.updateMany({
        data: { status: data.SmsStatus },
        where: { sid: data.SmsSid },
      });

      return [updated.count];
    } catch (error) {
      this.logger.error('Failed to update SMS status:', error);
      throw new Error('Failed to update SMS status');
    }
  }

  async receiveSms(data: ReceiveSmsInput): Promise<SmsEntity> {
    try {
      return this.smsRepository.create({
        data: {
          to: data.To,
          message: data.Body,
          from: data.From,
          sid: data.SmsSid,
          status: data.SmsStatus,
        },
      });
    } catch (error) {
      this.logger.error('Failed to save received SMS:', error);
      throw new Error('Failed to save received SMS');
    }
  }

  // Method to generate OTP
  private generateOtp(): string {
    const otp = randomInt(100000, 999999).toString();
    return otp;
  }

  // Method to send OTP via SMS using Twilio
  async sendOtpToMobile(phoneNumber: string): Promise<string> {
    const otp = this.generateOtp();

    try {
      //Send OTP via SMS using Twilio
      const key = `otp:${phoneNumber}`;
      const ttl = 5 * 60;
      await this.redisService.set(key, otp, ttl);

      await this.twilio.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_FROM_NUMBER,
        to: phoneNumber,
      });

      return otp;
    } catch (error) {
      this.logger.error(`Error sending OTP via SMS`, error);
      throw new Error('Failed to send OTP via SMS');
    }
  }

  async sendOtp(phoneNumber: string): Promise<{ otp: string }> {
    const otp = await this.sendOtpToMobile(phoneNumber);
    return { otp };
  }

  async verifyOtp(phoneNumber: string, enteredOtp: string): Promise<boolean> {
    const key = `otp:${phoneNumber}`;
    const storedOtp = await this.redisService.get(key);

    if (!storedOtp) return false;

    const isMatch = storedOtp === enteredOtp;

    if (isMatch) {
      // Видаляємо OTP після використання
      await this.redisService.del(key);
    }

    return isMatch;
  }
}
