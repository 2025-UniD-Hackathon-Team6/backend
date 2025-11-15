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
   * 캐시된 데이터가 있으면 반환하고, 없으면 새로 생성합니다.
   * @param userId - 사용자 ID
   * @returns 오늘의 키워드 정보
   */
  async getTodayKeyword(userId: number) {
    // 사용자 정보 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (!user.interests) {
      throw new NotFoundException('관심 직군/직무를 설정해주세요.');
    }

    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 사용자의 첫 번째 관심 직군 가져오기
    const primaryInterest = user.interests.split(',')[0].trim();

    // 캐시된 키워드 조회
    let dailyKeyword = await this.prisma.dailyKeyword.findFirst({
      where: {
        date: today,
        interest: primaryInterest,
      },
    });

    // 캐시된 데이터가 없으면 새로 생성
    if (!dailyKeyword) {
      this.logger.log(
        `Generating new daily keyword for ${primaryInterest} on ${today}`,
      );

      const generated = await this.upstage.generateDailyKeyword(primaryInterest);

      dailyKeyword = await this.prisma.dailyKeyword.create({
        data: {
          date: today,
          interest: primaryInterest,
          keyword: generated.keyword,
          description: generated.description,
        },
      });
    }

    return {
      date: dailyKeyword.date,
      interest: dailyKeyword.interest,
      keyword: dailyKeyword.keyword,
      description: dailyKeyword.description,
    };
  }

  /**
   * 오늘의 산업 리포트를 조회합니다.
   * 캐시된 데이터가 있으면 반환하고, 없으면 새로 생성합니다.
   * @param userId - 사용자 ID
   * @returns 오늘의 산업 리포트
   */
  async getTodayReport(userId: number) {
    // 사용자 정보 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (!user.interests) {
      throw new NotFoundException('관심 직군/직무를 설정해주세요.');
    }

    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 사용자의 첫 번째 관심 직군 가져오기
    const primaryInterest = user.interests.split(',')[0].trim();

    // 캐시된 리포트 조회
    let dailyReport = await this.prisma.dailyReport.findFirst({
      where: {
        date: today,
        interest: primaryInterest,
      },
    });

    // 캐시된 데이터가 없으면 새로 생성
    if (!dailyReport) {
      this.logger.log(
        `Generating new daily report for ${primaryInterest} on ${today}`,
      );

      const generated = await this.upstage.generateDailyReport(primaryInterest);

      dailyReport = await this.prisma.dailyReport.create({
        data: {
          date: today,
          interest: primaryInterest,
          title: generated.title,
          summary: generated.summary,
          content: generated.content,
        },
      });
    }

    return {
      date: dailyReport.date,
      interest: dailyReport.interest,
      title: dailyReport.title,
      summary: dailyReport.summary,
      content: dailyReport.content,
    };
  }
}
