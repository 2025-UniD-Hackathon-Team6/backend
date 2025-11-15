import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DailyService } from './daily.service';
import { JwtAuthGuard } from '@libs/jwt';

@Controller('api/daily')
@UseGuards(JwtAuthGuard)
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  /**
   * GET /api/daily/keyword
   * 오늘의 키워드를 조회합니다.
   */
  @Get('keyword')
  async getTodayKeyword(@Request() req) {
    const userId = req.user.userId;
    return this.dailyService.getTodayKeyword(userId);
  }

  /**
   * GET /api/daily/report
   * 오늘의 산업 리포트를 조회합니다.
   */
  @Get('report')
  async getTodayReport(@Request() req) {
    const userId = req.user.userId;
    return this.dailyService.getTodayReport(userId);
  }
}
