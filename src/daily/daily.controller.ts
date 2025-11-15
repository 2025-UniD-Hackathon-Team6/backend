import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DailyService } from './daily.service';
import { JwtAuthGuard, type AuthenticatedRequest } from '@libs/jwt';

@Controller('api/daily')
@UseGuards(JwtAuthGuard)
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  /**
   * GET /api/daily/keyword
   * 오늘의 키워드를 조회합니다.
   */
  @Get('keyword')
  async getTodayKeyword(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.dailyService.getTodayKeyword(userId);
  }

  /**
   * GET /api/daily/report
   * 오늘의 산업 리포트를 조회합니다.
   */
  @Get('report')
  async getTodayReport(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.dailyService.getTodayReport(userId);
  }
}
