import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UpstageService } from './upstage.service';

@Module({
  imports: [ConfigModule],
  providers: [UpstageService],
  exports: [UpstageService],
})
export class UpstageModule {}
