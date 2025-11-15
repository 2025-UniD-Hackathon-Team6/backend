import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DailyService } from './daily.service';
import { JwtAuthGuard, type AuthenticatedRequest } from '@libs/jwt';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('일일 정보')
@Controller('api/daily')
@UseGuards(JwtAuthGuard)
export class DailyController {
    constructor(private readonly dailyService: DailyService) {}

    @Get('keyword')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '오늘의 키워드 조회', description: '오늘의 키워드를 조회합니다.' })
    @ApiResponse({ status: 200, description: '키워드 조회 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async getTodayKeyword(@Req() req: AuthenticatedRequest) {
        const userId = req.user.id;
        return this.dailyService.getTodayKeyword(userId);
    }

    @Get('report')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '오늘의 산업 리포트 조회', description: '오늘의 산업 리포트를 조회합니다.' })
    @ApiResponse({ status: 200, description: '리포트 조회 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async getTodayReport(@Req() req: AuthenticatedRequest) {
        const userId = req.user.id;
        return this.dailyService.getTodayReport(userId);
    }
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
