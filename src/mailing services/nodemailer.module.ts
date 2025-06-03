// email.module.ts
import { Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { EmailController } from './nodemailer.controller';

@Module({
  providers: [NodemailerService],
  controllers: [EmailController],
})
export class NodemailerModule {}
