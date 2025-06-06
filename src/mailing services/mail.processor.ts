import { EMAIL_QUEUE } from '@/constants/queue.constants';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor(EMAIL_QUEUE)
export class NodemailerProcessor extends WorkerHost {
  async process(job: Job<any>) {
    const { to, subject, text } = job.data;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }
}
