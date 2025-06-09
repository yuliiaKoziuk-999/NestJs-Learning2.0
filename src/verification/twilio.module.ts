// src/sms/twilio.module.ts
import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { SmsRepository } from '../repository/sms.repository';
import { RedisService } from '@/redis/redis.service';

@Module({
  controllers: [TwilioController],
  providers: [TwilioService, SmsRepository, RedisService],
  exports: [TwilioService, RedisService],
  imports: [TwilioModule],
})
export class TwilioModule {}
