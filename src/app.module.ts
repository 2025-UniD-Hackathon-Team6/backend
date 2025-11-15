import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '@libs/prisma';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@libs/jwt';
import { JwtAuthModule } from '@libs/jwt';
import { JobController } from './job/job.controller';
import { JobModule } from './job/job.module';
import { AttendController } from './attend/attend.controller';
import { AttendService } from './attend/attend.service';
import { AttendModule } from './attend/attend.module';

@Module({
  imports: [AuthModule, PrismaModule, JwtAuthModule, JobModule, AttendModule],
  controllers: [AppController, JobController, AttendController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }, AttendService],
})
export class AppModule {}
