import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AttendService } from './attend.service';
import type { AuthenticatedRequest } from '@libs/jwt';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { DailyAttendDto } from './dto/daily-attend.dto';

@ApiTags('출석')
@Controller('attend')
export class AttendController {
    constructor(private readonly attendService: AttendService) {}

    @Post()
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '오늘 출석 체크', description: '오늘의 출석을 체크합니다.' })
    @ApiResponse({ status: 200, description: '출석 체크 성공' })
    @ApiResponse({ status: 406, description: '이미 출석 체크 완료' })
    async attend(
        @Req() req: AuthenticatedRequest,
        @Body() dailyAttendDto : DailyAttendDto
    ) {
        return await this.attendService.attend(req.user.id, dailyAttendDto);
    }

    @Get('today')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '오늘 출석 여부 조회', description: '오늘의 출석을 체크합니다.' })
    @ApiResponse({ status: 200, description: '출석 체크 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async checkTodayAttendance(
        @Req() req: AuthenticatedRequest
    ) {
        return await this.attendService.checkTodayAttendance(req.user.id);
    }

    @Get('month')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '이번 달 출석 조회', description: '이번 달의 출석 현황을 조회합니다.' })
    @ApiResponse({ status: 200, description: '출석 조회 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async checkMothlyAttendance(
        @Req() req: AuthenticatedRequest
    ) {
        return await this.attendService.checkMothlyAttendance(req.user.id);
    }

    @Get('routines')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '오늘의 커리어 루틴 추천',
        description: '출석 시 기록한 스트레스 수준과 관심 직무를 기반으로 맞춤형 커리어 루틴을 추천합니다.'
    })
    @ApiResponse({
        status: 200,
        description: '루틴 추천 성공',
        schema: {
            example: {
                date: '2025-11-15',
                stressLevel: 'Low',
                position: {
                    id: 1,
                    name: '데이터 분석가',
                    category: 'IT/개발'
                },
                routines: [
                    '✨ "집중도가 좋아요! 오늘은 Kaggle EDA 실습에 도전해보세요."',
                    '📊 "Window 함수로 SQL 난도 있는 문제를 5개 풀어볼까요?"',
                    '📚 "Python 데이터 분석 라이브러리 문서를 30분 읽어보는 건 어때요?"',
                    '📝 "A/B 테스트 개념을 정리해서 블로그에 포스팅해볼까요?"',
                    '🌈 "시각화 포트폴리오에 인터랙티브 차트 1개 추가해보세요!"',
                    '📌 "통계 기초 개념 퀴즈를 5개 풀어보는 미션 어때요?"'
                ]
            }
        }
    })
    @ApiResponse({ status: 404, description: '출석 기록 또는 관심 직무 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async getRoutineRecommendations(
        @Req() req: AuthenticatedRequest
    ) {
        return await this.attendService.getRoutineRecommendations(req.user.id);
    }
}
