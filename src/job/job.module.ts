import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaModule } from '@libs/prisma'; // ✅ 추가

@Module({
    imports: [PrismaModule], // ✅ 추가
    providers: [JobService],
    controllers: [JobController]
})
export class JobModule {}