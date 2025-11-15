import { Module } from '@nestjs/common';
import { DailyController } from './daily.controller';
import { DailyService } from './daily.service';
import { PrismaModule } from '@libs/prisma';
import { UpstageModule } from '../upstage/upstage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, UpstageModule, ConfigModule],
  controllers: [DailyController],
  providers: [DailyService],
})
export class DailyModule {}
