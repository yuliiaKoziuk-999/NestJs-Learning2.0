import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MyLoggerService } from '@/my-logger/my-logger.service';
import { MyLoggerModule } from '@/my-logger/my-logger.module';

@Module({
  imports: [PrismaModule, MyLoggerModule],
  providers: [TagsService, MyLoggerService],
  controllers: [TagsController],
  exports: [MyLoggerService],
})
export class TagsModule {}
