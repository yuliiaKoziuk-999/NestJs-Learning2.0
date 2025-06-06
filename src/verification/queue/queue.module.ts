import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from '@/constants/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
