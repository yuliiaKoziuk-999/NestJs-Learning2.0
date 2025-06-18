import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from '../categories/categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MyLoggerService } from '@/my-logger/my-logger.service';
import { MyLoggerModule } from '@/my-logger/my-logger.module';

@Module({
  imports: [PrismaModule, MyLoggerModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, MyLoggerService],
  exports: [MyLoggerService],
})
export class CategoriesModule {}
