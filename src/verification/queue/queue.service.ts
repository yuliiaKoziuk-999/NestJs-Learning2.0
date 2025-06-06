import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('emailQueue') private readonly emailQueue: Queue) {}

  async sendBulkEmails(
    emails: { to: string; subject: string; text: string }[],
  ) {
    for (const email of emails) {
      await this.emailQueue.add('sendEmail', email);
    }
  }
}
