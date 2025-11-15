import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '@libs/prisma';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@libs/jwt';
import { JwtAuthModule } from '@libs/jwt';

@Module({
  imports: [AuthModule, PrismaModule, JwtAuthModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
