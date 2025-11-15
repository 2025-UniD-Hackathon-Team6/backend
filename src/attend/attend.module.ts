import { Module } from '@nestjs/common';
import { AttendService } from './attend.service';
import { AttendController } from './attend.controller';
import { UpstageModule } from '../upstage/upstage.module';

@Module({
  imports: [UpstageModule],
  providers: [AttendService],
  controllers: [AttendController]
})
export class AttendModule {}
