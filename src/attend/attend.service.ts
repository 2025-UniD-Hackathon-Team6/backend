import { PrismaService } from '@libs/prisma';
import { Injectable, NotAcceptableException, NotFoundException, Logger } from '@nestjs/common';
import type { DailyAttendDto } from './dto/daily-attend.dto';
import { UpstageService } from '../upstage/upstage.service';
import type { RoutineRecommendationResponseDto } from './dto/routine-recommendation.dto';

@Injectable()
export class AttendService {
    private readonly logger = new Logger(AttendService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly upstage: UpstageService,
    ) {}

    async attend(
        userId: number,
        dailyAttendDto : DailyAttendDto
    ) {
        const todayCheck = await this.checkTodayAttendance(userId);
        if (todayCheck) {
            throw new NotAcceptableException('already recorded')
        }

        return await this.prisma.dailyAttendance.create({
            data: {
                userId,
                ...dailyAttendDto
            }
        })
    }

    async checkTodayAttendance(userId: number){
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘 0시 0분 0초

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return await this.prisma.dailyAttendance.findFirst({
            where: {
                userId,
                checkinDate: {
                    gte: today,
                    lt: tomorrow
                }
            },
            orderBy: {
                checkinDate: 'asc'
            }
        })
    }

    async checkMothlyAttendance(userId: number){
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return await this.prisma.dailyAttendance.findMany({
            where: {
                userId,
                checkinDate: {
                    gte: startOfMonth,
                    lt: startOfNextMonth
                }
            },
            orderBy: {
                checkinDate: 'asc'
            }
        })
    }

    /**
     * 오늘의 출석 기록 기반으로 맞춤형 커리어 루틴을 추천합니다.
     * @param userId - 사용자 ID
     * @returns 루틴 추천 정보
     */
    async getRoutineRecommendations(userId: number): Promise<RoutineRecommendationResponseDto> {
        // 1. 오늘의 출석 기록 조회
        const todayAttendance = await this.checkTodayAttendance(userId);
        if (!todayAttendance) {
            throw new NotFoundException(
                '오늘의 출석 기록이 없습니다. 먼저 출석 체크를 해주세요.',
            );
        }

        // 2. 사용자의 관심 직무 조회
        const userInterest = await this.prisma.userInterestedPosition.findUnique({
            where: { userId },
            include: {
                position: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        if (!userInterest) {
            throw new NotFoundException(
                '관심 직무를 설정해주세요. UserInterestedPosition이 필요합니다.',
            );
        }

        const position = userInterest.position;
        const category = position.category;

        this.logger.log(
            `Generating routine recommendations for user ${userId}, stress: ${todayAttendance.stressLevel}, position: ${position.name}`,
        );

        // 3. AI를 통해 루틴 추천 생성
        const generated = await this.upstage.generateCareerRoutines(
            {
                positionName: position.name,
                categoryName: category.name,
                positionDescription: position.description,
                categoryDescription: category.description,
            },
            todayAttendance.stressLevel,
        );

        // 4. 응답 데이터 구성
        return {
            date: todayAttendance.checkinDate.toISOString().split('T')[0],
            stressLevel: todayAttendance.stressLevel,
            position: {
                id: position.id,
                name: position.name,
                category: category.name,
            },
            routines: generated.routines,
        };
    }
}
