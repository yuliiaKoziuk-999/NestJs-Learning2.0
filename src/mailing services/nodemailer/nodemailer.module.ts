import { Module } from '@nestjs/common';
import { NodemailerController } from './nodemailer.controller';
import { NodemailerService } from './nodemailer.service';

import { BullModule } from '@nestjs/bullmq';
import { NodemailerProcessor } from '../mail.processor';
import { QueueService } from '../queue/queue.service';
import { EMAIL_QUEUE } from '@/constants/queue.constants';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'redis_container',
        port: 6379,
      },
    }),

    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  controllers: [NodemailerController],
  providers: [NodemailerService, NodemailerProcessor, QueueService],
})
export class NodemailerModule {}
