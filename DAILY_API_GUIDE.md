# Daily Keyword & Report API 가이드 (v2 - Position 기반)

## 개요

Upstage Solar API를 활용하여 사용자의 관심 직무(JobPosition)에 맞춤화된 오늘의 키워드와 산업 리포트를 제공하는 API입니다.

## 주요 변경 사항 (v2)

### ✨ 개인화 강화
- **사용자별 독립 생성**: 같은 직무라도 사용자마다 다른 키워드/리포트 생성
- **Position 기반**: `UserInterestedPosition` 테이블 활용
- **풍부한 컨텍스트**: Category + Position 정보를 AI 프롬프트에 활용

### 📊 캐싱 전략 변경
- 기존: `date + interest(문자열)`
- 신규: `date + userId` ← **사용자별 일일 1회 생성**
- 다른 사용자는 동일 직무라도 새로운 콘텐츠 생성

## 구현된 기능

### 1. 오늘의 키워드 API
- **엔드포인트**: `GET /api/daily/keyword`
- **인증**: JWT 토큰 필요
- **설명**: 사용자의 관심 직무에 대한 오늘의 학습 키워드를 제공합니다.
- **응답 예시**:
```json
{
  "date": "2025-11-15",
  "position": {
    "id": 3,
    "name": "백엔드 개발자",
    "category": "개발"
  },
  "keyword": "이벤트 드리븐 아키텍처",
  "description": "이벤트 드리븐 아키텍처는 이벤트의 생성, 감지, 소비를 중심으로 설계된 소프트웨어 아키텍처 패턴입니다..."
}
```

### 2. 오늘의 산업 리포트 API
- **엔드포인트**: `GET /api/daily/report`
- **인증**: JWT 토큰 필요
- **설명**: 사용자의 관심 직무에 대한 3분 산업 리포트를 제공합니다.
- **응답 예시**:
```json
{
  "date": "2025-11-15",
  "position": {
    "id": 3,
    "name": "백엔드 개발자",
    "category": "개발"
  },
  "title": "2025년 백엔드 개발의 변화: 클라우드 네이티브와 AI 통합",
  "summary": "최근 백엔드 개발에서는 클라우드 네이티브 기술과 AI 통합이 주요 트렌드로 부상하고 있습니다...",
  "content": "상세 리포트 내용..."
}
```

### 3. Job API (사전 요구사항)
사용자는 먼저 관심 직무를 설정해야 합니다:

**관심 Position 설정**:
- 엔드포인트: `POST /api/jobs/interested-position`
- Body: `{ "positionId": 3 }`

**관심 Category 설정**:
- 엔드포인트: `POST /api/jobs/interested-category`
- Body: `{ "categoryId": 1 }`

## 설정 방법

### 1. 환경 변수 설정

`.env` 파일에 다음 환경 변수를 설정해주세요:

```env
DATABASE_URL="file:./main.db"
JWT_SECRET="your-jwt-secret-key"
UPSTAGE_API_KEY="your-upstage-api-key"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

### 2. Upstage API 키 발급

1. [Upstage Console](https://console.upstage.ai/)에 접속
2. API Keys 메뉴에서 'Create New Key' 클릭
3. 발급받은 API 키를 `.env` 파일의 `UPSTAGE_API_KEY`에 입력

### 3. 데이터베이스 마이그레이션

```bash
npm run prisma:push
```

### 4. 서버 실행

```bash
npm run start:dev
```

## 데이터베이스 스키마

### User 모델
- `interests`: (deprecated) 문자열 기반 관심사
- `UserInterestedPosition`: 사용자 관심 직무 (1:1)
- `dailyKeywords`: 사용자별 일일 키워드 (1:N)
- `dailyReports`: 사용자별 일일 리포트 (1:N)

### DailyKeyword 모델
- `date`: 날짜 (YYYY-MM-DD 형식)
- `userId`: 사용자 ID
- `positionId`: 직무 ID
- `keyword`: 오늘의 키워드
- `description`: 키워드 설명
- **Unique**: `[date, userId]` ← 사용자별 일일 1회

### DailyReport 모델
- `date`: 날짜 (YYYY-MM-DD 형식)
- `userId`: 사용자 ID
- `positionId`: 직무 ID
- `title`: 리포트 제목
- `summary`: 3분 산업 리포트 요약
- `content`: 전체 리포트 내용
- **Unique**: `[date, userId]` ← 사용자별 일일 1회

### JobPosition 모델
- `id`: Position ID
- `categoryId`: 소속 카테고리 ID
- `name`: 직무명 (예: "백엔드 개발자")
- `description`: 직무 설명
- `category`: Category 관계
- `dailyKeywords`: 이 직무의 일일 키워드들
- `dailyReports`: 이 직무의 일일 리포트들

### UserInterestedPosition 모델
- `userId`: 사용자 ID (unique)
- `positionId`: 관심 직무 ID
- 한 사용자는 하나의 관심 직무만 설정 가능

## 캐싱 전략

### 사용자별 개인화 캐싱
- **키**: `date + userId`
- **효과**:
  - 사용자 A → "백엔드 개발자" → 키워드: "이벤트 드리븐"
  - 사용자 B → "백엔드 개발자" → 키워드: "마이크로서비스" (다름!)
  - 사용자 A 재요청 → 캐시에서 "이벤트 드리븐" 반환 (빠름)

### 비용 vs 개인화 균형
- 각 사용자마다 하루 1회 API 호출
- 같은 날 재요청 시 캐시 사용 (무료)
- 진정한 개인화 경험 제공

## 구현 세부사항

### 1. UpstageService (`src/upstage/upstage.service.ts`)
- Position과 Category 정보를 활용한 풍부한 프롬프트
- `PositionContext` 인터페이스로 구조화된 데이터 전달
- 매번 다양한 키워드/리포트 생성 유도

```typescript
interface PositionContext {
  positionName: string;
  categoryName: string;
  positionDescription?: string | null;
  categoryDescription?: string | null;
}
```

### 2. DailyService (`src/daily/daily.service.ts`)
- `UserInterestedPosition`에서 사용자의 관심 직무 조회
- Category 정보도 함께 로드 (include)
- 사용자별 캐시 조회: `findUnique({ where: { date_userId: { date, userId } } })`

### 3. DailyController (`src/daily/daily.controller.ts`)
- JWT 인증을 통한 사용자 확인
- `req.user.id`로 사용자 ID 전달

## 사용 예시

### 1. 회원가입 및 로그인
```bash
# 회원가입
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "user1", "password": "password123", "realName": "홍길동"}'

# 로그인
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "user1", "password": "password123"}'
```

### 2. 관심 직무 설정 (필수!)
```bash
# Category 조회
curl -X GET http://localhost:4000/api/jobs/categories \
  -H "Authorization: Bearer YOUR_TOKEN"

# Position 조회 (특정 Category의)
curl -X GET "http://localhost:4000/api/jobs/positions?categoryId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 관심 Position 설정
curl -X POST http://localhost:4000/api/jobs/interested-position \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"positionId": 3}'
```

### 3. 오늘의 키워드 조회
```bash
curl -X GET http://localhost:4000/api/daily/keyword \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. 오늘의 산업 리포트 조회
```bash
curl -X GET http://localhost:4000/api/daily/report \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 테스트 시나리오

### 시나리오 1: 사용자별 다른 콘텐츠
```
1. 사용자 A 로그인 → Position 3 (백엔드 개발자) 설정
2. GET /api/daily/keyword → "이벤트 드리븐 아키텍처"
3. 사용자 B 로그인 → Position 3 (백엔드 개발자) 설정
4. GET /api/daily/keyword → "컨테이너 오케스트레이션" (다름!)
```

### 시나리오 2: 사용자별 캐싱
```
1. 사용자 A가 GET /api/daily/keyword (느림, Upstage API 호출)
2. 사용자 A가 재요청 (빠름, 캐시)
3. 사용자 B가 GET /api/daily/keyword (느림, 새로운 API 호출)
```

### 시나리오 3: Position 변경
```
1. 사용자 A: Position 3 (백엔드) → 키워드 조회
2. Position 5 (프론트엔드)로 변경
3. 키워드 재조회 → 프론트엔드 관련 키워드 (새로 생성)
```

## 주의사항

1. **API 키 보안**: `.env` 파일을 절대 Git에 커밋하지 마세요.
2. **관심 직무 설정**: 오늘의 키워드 및 리포트를 조회하기 전에 반드시 `UserInterestedPosition`을 설정해야 합니다.
3. **API 호출 비용**: 사용자별로 하루 1회 API 호출이 발생합니다. 사용자 수에 비례하여 비용이 증가합니다.
4. **Position Description**: Position/Category의 description을 상세하게 작성하면 더 정확한 AI 응답을 받을 수 있습니다.

## 마이그레이션 가이드 (v1 → v2)

### 기존 사용자 (interests 문자열 사용)
1. Job API로 Category/Position 목록 조회
2. 사용자의 interests와 매칭되는 Position 찾기
3. `UserInterestedPosition` 생성
4. 이후 Daily API 사용 가능

### 코드 변경사항
- ❌ `user.interests` 문자열 → ✅ `UserInterestedPosition` 관계
- ❌ `date + interest` 캐싱 → ✅ `date + userId` 캐싱
- ✅ Position/Category 정보를 AI 프롬프트에 활용

## 향후 개선 사항

1. 사용자의 `JobPostingArchive` 데이터 활용한 초개인화
2. 여러 관심 Position 지원 (현재 1개만)
3. 키워드 및 리포트 히스토리 조회 기능
4. 사용자 피드백 기반 추천 개선
5. Position별 통계 (인기 키워드 등)
