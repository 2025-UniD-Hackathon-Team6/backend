import { PrismaService } from '@libs/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AttendService {
    constructor(private readonly prisma: PrismaService) {}
}
