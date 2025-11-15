import { Body, Controller, Delete, Get, Post, Req, Query } from '@nestjs/common';
import { JobService } from './job.service';
import { AuthNotNeeded, type AuthenticatedRequest } from '@libs/jwt';
import { InterestIds } from './dto/interest-ids.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('채용')
@Controller('job')
export class JobController {
    constructor(private readonly jobService: JobService) {}

    @AuthNotNeeded()
    @Get('categories')
    @ApiOperation({ summary: '카테고리 목록 조회', description: '모든 채용 카테고리를 조회합니다.' })
    @ApiResponse({ status: 200, description: '카테고리 목록 조회 성공' })
    async getCategories() {
        return await this.jobService.getCategories();
    }

    @AuthNotNeeded()
    @Get('positions')
    @ApiOperation({ summary: '포지션 목록 조회', description: '모든 채용 포지션을 조회합니다.' })
    @ApiResponse({ status: 200, description: '포지션 목록 조회 성공' })
    async getPositions() {
        return await this.jobService.getPositions();
    }

    @Post('categories/interest')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '관심 카테고리 추가', description: '사용자의 관심 카테고리를 여러 개 추가합니다.' })
    @ApiBody({ type: InterestIds })
    @ApiResponse({ status: 201, description: '관심 카테고리 추가 성공' })
    @ApiResponse({ status: 422, description: '잘못된 아이디' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async addInterestedCategories(
        @Req() req: AuthenticatedRequest,
        @Body() categoryIds: InterestIds,
    ) {
        return await this.jobService.addInterestedCategories(
            req.user.id,
            categoryIds.Ids
        );
    }

    @Post('positions/interest')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '관심 포지션 추가', description: '사용자의 관심 포지션을 여러 개 추가합니다.' })
    @ApiBody({ type: InterestIds })
    @ApiResponse({ status: 201, description: '관심 포지션 추가 성공' })
    @ApiResponse({ status: 422, description: '잘못된 아이디' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async addInterestedPositions(
        @Req() req: AuthenticatedRequest,
        @Body() positionIds: InterestIds,
    ) {
        return await this.jobService.addInterestedPositions(
            req.user.id,
            positionIds.Ids
        );
    }

    @Delete('categories/interest')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '관심 카테고리 삭제', description: '사용자의 관심 카테고리를 여러 개 삭제합니다.' })
    @ApiBody({ type: InterestIds })
    @ApiResponse({ status: 200, description: '관심 카테고리 삭제 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async deleteInterestedCategories(
        @Req() req: AuthenticatedRequest,
        @Body() categoryIds: InterestIds,
    ) {
        return await this.jobService.deleteInterestedCategories(
            req.user.id,
            categoryIds.Ids
        );
    }

    @Delete('positions/interest')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '관심 포지션 삭제', description: '사용자의 관심 포지션을 여러 개 삭제합니다.' })
    @ApiBody({ type: InterestIds })
    @ApiResponse({ status: 200, description: '관심 포지션 삭제 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async deleteInterestedPositions(
        @Req() req: AuthenticatedRequest,
        @Body() positionIds: InterestIds,
    ) {
        return await this.jobService.deleteInterestedPositions(
            req.user.id,
            positionIds.Ids
        );
    }

    @Post('sync')
    @AuthNotNeeded()
    @ApiOperation({
        summary: '채용공고 데이터 동기화',
        description: 'Data.go.kr API에서 채용공고를 가져와 DB에 저장합니다.'
    })
    @ApiQuery({ name: 'numOfRows', required: false, type: Number, description: '가져올 공고 수 (기본값: 100)' })
    @ApiResponse({ status: 200, description: '동기화 성공' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async syncJobPostings(@Query('numOfRows') numOfRows?: number) {
        const rows = numOfRows ? parseInt(numOfRows.toString(), 10) : 100;
        return await this.jobService.syncJobPostingsFromDataGoKr(rows);
    }

    @Get('recommended')
    @AuthNotNeeded()
    @ApiOperation({
        summary: '직무/직군에 따른 채용공고 추천',
        description: '사용자의 관심 직군/직무에 따라 DB에 저장된 채용공고를 추천합니다. 인증된 사용자의 경우 관심사를 기반으로 필터링하고, 비인증 사용자의 경우 전체 공고를 반환합니다.'
    })
    @ApiQuery({ name: 'numOfRows', required: false, type: Number, description: '결과 수 (기본값: 10)' })
    @ApiResponse({ status: 200, description: '채용공고 추천 성공' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async getRecommendedJobs(
        @Req() req: AuthenticatedRequest,
        @Query('numOfRows') numOfRows?: number,
    ) {
        const userId = req.user?.id; // 인증된 경우에만 userId가 있음
        const rows = numOfRows ? parseInt(numOfRows.toString(), 10) : 10;

        return await this.jobService.getRecommendedJobs(userId, rows);
    }
}
