import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MyLoggerModule } from '@/my-logger/my-logger.module';

@Global()
@Module({
  imports: [MyLoggerModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
