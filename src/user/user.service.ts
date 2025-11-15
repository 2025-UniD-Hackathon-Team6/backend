import { PrismaService } from '@libs/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async Test() {
    return await this.prisma.job.findMany();
  }
}
