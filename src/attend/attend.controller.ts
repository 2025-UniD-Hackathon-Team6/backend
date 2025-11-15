import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AttendService } from './attend.service';
import type { AuthenticatedRequest } from '@libs/jwt';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { DailyAttendDto } from './dto/daily-attend.dto';

@ApiTags('출석')
@Controller('attend')
export class AttendController {
    constructor(private readonly attendService: AttendService) {}

    @Get()
    async attend(
        @Req() req: AuthenticatedRequest,
        @Body() dailyAttendDto : DailyAttendDto
    ) {
        return await this.attendService.attend(req.user.id, dailyAttendDto);
    }

    @Post('today')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '오늘 출석 체크', description: '오늘의 출석을 체크합니다.' })
    @ApiResponse({ status: 200, description: '출석 체크 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async checkTodayAttendance(
        @Req() req: AuthenticatedRequest
    ) {
        return await this.attendService.checkTodayAttendance(req.user.id);
    }

    @Post('month')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '이번 달 출석 조회', description: '이번 달의 출석 현황을 조회합니다.' })
    @ApiResponse({ status: 200, description: '출석 조회 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async checkMothlyAttendance(
        @Req() req: AuthenticatedRequest
    ) {
        return await this.attendService.checkMothlyAttendance(req.user.id);
    }
}
