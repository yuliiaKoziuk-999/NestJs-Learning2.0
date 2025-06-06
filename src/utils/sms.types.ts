import { TwilioService } from '@/verification/twilio.service';
import { sms_status_enum } from '@prisma/client';

export type SmsService = TwilioService;
export type Sms = {
  id: string;

  to: string;

  from: string;

  sid: string;

  status: sms_status_enum;

  message: string;

  createdAt: Date;

  updatedAt: Date;
};
