import { Module } from '@nestjs/common';
import { NodemailerController } from './nodemailer.controller';
import { NodemailerService } from './nodemailer.service';

import { BullModule } from '@nestjs/bullmq';
import { NodemailerProcessor } from '../mail.processor';
import { QueueService } from '../queue/queue.service';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),

    BullModule.registerQueue({
      name: 'emailQueue',
    }),
  ],
  controllers: [NodemailerController],
  providers: [NodemailerService, NodemailerProcessor, QueueService],
})
export class NodemailerModule {}
