import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Sms } from '@prisma/client';

@Injectable()
export class SmsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.SmsCreateArgs): Promise<Sms> {
    return this.prisma.sms.create(args);
  }

  async findUnique(args: Prisma.SmsFindUniqueArgs): Promise<Sms | null> {
    return this.prisma.sms.findUnique(args);
  }

  async findMany(args: Prisma.SmsFindManyArgs): Promise<Sms[]> {
    return this.prisma.sms.findMany(args);
  }

  async update(args: Prisma.SmsUpdateArgs): Promise<Sms> {
    return this.prisma.sms.update(args);
  }

  async updateMany(
    args: Prisma.SmsUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.sms.updateMany(args);
  }

  async delete(args: Prisma.SmsDeleteArgs): Promise<Sms> {
    return this.prisma.sms.delete(args);
  }
}
