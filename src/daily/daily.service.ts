import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { UpstageService } from '../upstage/upstage.service';

@Injectable()
export class DailyService {
  private readonly logger = new Logger(DailyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly upstage: UpstageService,
  ) {}

  /**
   * 오늘의 키워드를 조회합니다.
   * 사용자별로 캐시된 데이터가 있으면 반환하고, 없으면 새로 생성합니다.
   * @param userId - 사용자 ID
   * @returns 오늘의 키워드 정보
   */
  async getTodayKeyword(userId: number) {
    // 1. 사용자의 관심 Position 조회 (Category 정보 포함)
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

    const today = new Date().toISOString().split('T')[0];
    const position = userInterest.position;
    const category = position.category;

    // 2. 사용자별 캐싱된 키워드 조회
    let dailyKeyword = await this.prisma.dailyKeyword.findUnique({
      where: {
        date_userId: {
          date: today,
          userId,
        },
      },
      include: {
        position: {
          include: {
            category: true,
          },
        },
      },
    });

    // 3. 캐시된 데이터가 없으면 새로 생성
    if (!dailyKeyword) {
      this.logger.log(
        `Generating new daily keyword for user ${userId}, position: ${position.name} (${category.name}) on ${today}`,
      );

      const generated = await this.upstage.generateDailyKeyword({
          positionName: position.name,
        categoryName: category.name,
        positionDescription: position.description,
        categoryDescription: category.description,

      });

      dailyKeyword = await this.prisma.dailyKeyword.create({
        data: {
          date: today,
          userId,
          positionId: position.id,
          keyword: generated.keyword,
          description: generated.description,
        },
        include: {
          position: {
            include: {
              category: true,
            },
          },
        },
      });
    }

    return {
      date: dailyKeyword.date,
      position: {
        id: dailyKeyword.position.id,
        name: dailyKeyword.position.name,
        category: dailyKeyword.position.category.name,
      },
      keyword: dailyKeyword.keyword,
      description: dailyKeyword.description,
    };
  }

  /**
   * 오늘의 산업 리포트를 조회합니다.
   * 사용자별로 캐시된 데이터가 있으면 반환하고, 없으면 새로 생성합니다.
   * @param userId - 사용자 ID
   * @returns 오늘의 산업 리포트
   */
  async getTodayReport(userId: number) {
    // 1. 사용자의 관심 Position 조회 (Category 정보 포함)
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

    const today = new Date().toISOString().split('T')[0];
    const position = userInterest.position;
    const category = position.category;

    // 2. 사용자별 캐싱된 리포트 조회
    let dailyReport = await this.prisma.dailyReport.findUnique({
      where: {
        date_userId: {
          date: today,
          userId,
        },
      },
      include: {
        position: {
          include: {
            category: true,
          },
        },
      },
    });

    // 3. 캐시된 데이터가 없으면 새로 생성
    if (!dailyReport) {
      this.logger.log(
        `Generating new daily report for user ${userId}, position: ${position.name} (${category.name}) on ${today}`,
      );

      const generated = await this.upstage.generateDailyReport({
        positionName: position.name,
        categoryName: category.name,
        positionDescription: position.description,
        categoryDescription: category.description,
      });

      dailyReport = await this.prisma.dailyReport.create({
        data: {
          date: today,
          userId,
          positionId: position.id,
          title: generated.title,
          summary: generated.summary,
          content: generated.content,
        },
        include: {
          position: {
            include: {
              category: true,
            },
          },
        },
      });
    }

    return {
      date: dailyReport.date,
      position: {
        id: dailyReport.position.id,
        name: dailyReport.position.name,
        category: dailyReport.position.category.name,
      },
      title: dailyReport.title,
      summary: dailyReport.summary,
      content: dailyReport.content,
    };
  }
}
