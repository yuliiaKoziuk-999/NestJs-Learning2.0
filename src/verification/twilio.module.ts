// src/sms/twilio.module.ts
import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { SmsRepository } from '../repository/sms.repository';

@Module({
  controllers: [TwilioController],
  providers: [TwilioService, SmsRepository],
  exports: [TwilioService],
  imports: [TwilioModule],
})
export class TwilioModule {}
