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
}
