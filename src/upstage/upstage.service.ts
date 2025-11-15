import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface PositionContext {
  positionName: string;
  categoryName: string;
  positionDescription?: string | null;
  categoryDescription?: string | null;
}

@Injectable()
export class UpstageService {
  private readonly logger = new Logger(UpstageService.name);
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('UPSTAGE_API_KEY');

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.upstage.ai/v1/solar',
    });
  }

  /**
   * Upstage Solar API를 사용하여 채팅 완성을 생성합니다.
   * @param messages - 채팅 메시지 배열
   * @param model - 사용할 모델 (기본값: 'solar-pro')
   * @returns 생성된 응답 텍스트
   */
  async createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    model: string = 'solar-pro',
  ): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Failed to create chat completion', error);
      throw new Error('Upstage API 호출 중 오류가 발생했습니다.');
    }
  }

  /**
   * Position 정보를 기반으로 컨텍스트 문자열을 생성합니다.
   */
  private buildPositionContext(context: PositionContext): string {
    let ctx = `${context.categoryName} 분야의 ${context.positionName} 직무`;

    if (context.positionDescription) {
      ctx += `\n직무 설명: ${context.positionDescription}`;
    }

    if (context.categoryDescription) {
      ctx += `\n분야 설명: ${context.categoryDescription}`;
    }

    return ctx;
  }

  /**
   * 특정 직무에 대한 오늘의 키워드를 생성합니다.
   * @param context - Position 및 Category 정보
   * @returns 키워드 및 설명
   */
  async generateDailyKeyword(context: PositionContext): Promise<{
    keyword: string;
    description: string;
  }> {
    const positionInfo = this.buildPositionContext(context);

    const messages = [
      {
        role: 'system' as const,
        content: `당신은 취업 준비생을 돕는 전문 커리어 컨설턴트입니다. 최신 산업 트렌드와 채용 시장을 분석하여 도움이 되는 키워드를 제공합니다.`,
      },
      {
        role: 'user' as const,
        content: `다음 직무의 취업 준비생을 위한 오늘의 학습 키워드 1개를 추천해주세요.

${positionInfo}

응답 형식:
키워드: [키워드명]
설명: [키워드에 대한 간단한 설명 (2-3문장)]

요구사항:
1. 현재 ${context.categoryName} 분야의 ${context.positionName} 직무에서 중요한 기술, 개념, 트렌드를 반영
2. 면접이나 실무에서 자주 언급되는 주제
3. 하루 만에 기본 개념을 이해할 수 있는 수준의 키워드
4. 각 사용자에게 매번 다른 키워드를 제공하여 다양한 학습 기회 제공`,
      },
    ];

    const response = await this.createChatCompletion(messages);

    // 응답 파싱
    const keywordMatch = response.match(/키워드:\s*(.+)/);
    const descriptionMatch = response.match(/설명:\s*(.+)/s);

    return {
      keyword: keywordMatch ? keywordMatch[1].trim() : '기본 키워드',
      description: descriptionMatch ? descriptionMatch[1].trim() : response,
    };
  }

  /**
   * 특정 직무에 대한 3분 산업 리포트를 생성합니다.
   * @param context - Position 및 Category 정보
   * @returns 리포트 제목, 요약, 전체 내용
   */
  async generateDailyReport(context: PositionContext): Promise<{
    title: string;
    summary: string;
    content: string;
  }> {
    const positionInfo = this.buildPositionContext(context);

    const messages = [
      {
        role: 'system' as const,
        content: `당신은 산업 분석 전문가입니다. 최신 산업 뉴스와 트렌드를 분석하여 취업 준비생들에게 유용한 정보를 제공합니다.`,
      },
      {
        role: 'user' as const,
        content: `다음 직무를 준비하는 취업 준비생을 위한 오늘의 3분 산업 리포트를 작성해주세요.

${positionInfo}

응답 형식:
제목: [리포트 제목]
요약: [3-4문장의 핵심 요약]
내용: [상세 리포트 내용]

요구사항:
1. ${context.categoryName} 분야의 최신 트렌드, 기술 동향, 시장 변화를 반영
2. ${context.positionName} 직무에 특화된 정보 포함
3. 취업 준비생이 알아야 할 핵심 정보 포함
4. 3분 안에 읽을 수 있는 분량 (500-800자)
5. 실무에 도움이 되는 인사이트 제공
6. 각 사용자에게 다양한 관점의 리포트를 제공`,
      },
    ];

    const response = await this.createChatCompletion(messages);

    // 응답 파싱
    const titleMatch = response.match(/제목:\s*(.+)/);
    const summaryMatch = response.match(/요약:\s*(.+?)(?=\n내용:)/s);
    const contentMatch = response.match(/내용:\s*(.+)/s);

    return {
      title: titleMatch
        ? titleMatch[1].trim()
        : `${context.categoryName} - ${context.positionName} 산업 리포트`,
      summary: summaryMatch ? summaryMatch[1].trim() : response.substring(0, 200),
      content: contentMatch ? contentMatch[1].trim() : response,
    };
  }

  /**
   * 스트레스 수준과 직무에 따른 맞춤형 커리어 루틴을 생성합니다.
   * @param context - Position 및 Category 정보
   * @param stressLevel - 현재 스트레스 수준
   * @returns 추천 루틴 목록
   */
  async generateCareerRoutines(
    context: PositionContext,
    stressLevel: 'ExtremelyHigh' | 'High' | 'Middle' | 'Low' | 'ExtremelyLow',
  ): Promise<{
    routines: string[];
  }> {
    const positionInfo = this.buildPositionContext(context);

    // 스트레스 수준별 가이드라인
    const stressGuide = {
      ExtremelyHigh: '매우 높은 스트레스 상태: 5분 이내로 완료 가능한 아주 가벼운 미션. 부담 없이 시작할 수 있는 것',
      High: '높은 스트레스 상태: 10-15분 정도의 간단한 미션. 집중도가 낮아도 할 수 있는 것',
      Middle: '중간 스트레스 상태: 20-30분 정도의 적당한 난이도 미션. 가볍게 개념을 정리하거나 읽는 활동',
      Low: '낮은 스트레스 상태: 30-60분 정도의 실습 미션. 집중해서 문제를 풀거나 코딩하는 활동',
      ExtremelyLow: '매우 낮은 스트레스 상태: 1-2시간 정도의 도전적인 미션. 복잡한 프로젝트나 심화 학습',
    };

    const messages = [
      {
        role: 'system' as const,
        content: `당신은 취업 준비생의 멘탈 케어와 커리어 성장을 함께 돕는 전문 코치입니다.
사용자의 현재 컨디션에 맞는 적절한 난이도의 학습/성장 미션을 제안합니다.`,
      },
      {
        role: 'user' as const,
        content: `다음 정보를 바탕으로 오늘의 커리어 루틴을 6개 추천해주세요.

직무 정보:
${positionInfo}

현재 상태:
- 스트레스 수준: ${stressLevel}
- 가이드라인: ${stressGuide[stressLevel]}

응답 형식 (각 라인은 이모지로 시작):
✨ "첫 번째 루틴 추천 메시지"
📊 "두 번째 루틴 추천 메시지"
📚 "세 번째 루틴 추천 메시지"
📝 "네 번째 루틴 추천 메시지"
🌈 "다섯 번째 루틴 추천 메시지"
📌 "여섯 번째 루틴 추천 메시지"

요구사항:
1. 각 루틴은 반드시 이모지로 시작하고 큰따옴표로 감싸진 한 문장
2. ${context.positionName} 직무에 실제로 도움이 되는 구체적인 활동 제안
3. 스트레스 수준에 맞는 적절한 난이도와 소요 시간
4. 친근하고 응원하는 톤으로 작성
5. 구체적인 액션 아이템 포함 (예: "3개 풀기", "2페이지 읽기", "1개 그려보기")
6. 매번 다양한 루틴을 제안하여 지루하지 않게

예시 (데이터 분석가, 스트레스 낮음):
✨ "집중도가 좋아요! 오늘은 Kaggle EDA 실습에 도전해보세요."
📊 "Window 함수로 SQL 난도 있는 문제를 5개 풀어볼까요?"

예시 (데이터 분석가, 스트레스 높음):
🌈 "뇌 피로도가 높아요! Seaborn으로 막대그래프 1개만 그려보는 미션 어때요?"
📌 "포트폴리오 문장 1개만 부드럽게 다듬어볼까요?"`,
      },
    ];

    const response = await this.createChatCompletion(messages);

    // 응답을 줄바꿈으로 분리하고 이모지로 시작하는 라인만 추출
    const lines = response.split('\n').filter((line) => line.trim().length > 0);
    const routines = lines
      .filter((line) => /^[^\w\s]/.test(line.trim())) // 이모지로 시작하는지 확인
      .map((line) => line.trim());

    // 최소 1개는 보장
    if (routines.length === 0) {
      return {
        routines: [
          `✨ "${context.positionName} 직무 관련 학습을 시작해보세요!"`,
        ],
      };
    }

    return { routines };
  }
}
