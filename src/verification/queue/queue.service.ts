import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from '@/constants/queue.constants';

@Injectable()
export class QueueService {
  constructor(@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue) {}

  async sendBulkEmails(
    emails: { to: string; subject: string; text: string }[],
  ) {
    for (const email of emails) {
      await this.emailQueue.add('sendEmail', email);
    }
  }
}
