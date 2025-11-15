import type { PrismaService } from '@libs/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobService {
    constructor(private readonly prisma: PrismaService) {}
}
