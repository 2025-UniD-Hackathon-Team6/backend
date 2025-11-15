# Daily Keyword & Report API 가이드

## 개요

Upstage Solar API를 활용하여 사용자의 관심 직군/직무에 맞춤화된 오늘의 키워드와 산업 리포트를 제공하는 API입니다.

## 구현된 기능

### 1. 오늘의 키워드 API
- **엔드포인트**: `GET /api/daily/keyword`
- **인증**: JWT 토큰 필요
- **설명**: 사용자의 관심 직군/직무에 대한 오늘의 학습 키워드를 제공합니다.
- **응답 예시**:
```json
{
  "date": "2025-11-15",
  "interest": "백엔드 개발",
  "keyword": "마이크로서비스 아키텍처",
  "description": "마이크로서비스는 애플리케이션을 작고 독립적인 서비스로 분할하는 아키텍처 패턴입니다..."
}
```

### 2. 오늘의 산업 리포트 API
- **엔드포인트**: `GET /api/daily/report`
- **인증**: JWT 토큰 필요
- **설명**: 사용자의 관심 직군/직무에 대한 3분 산업 리포트를 제공합니다.
- **응답 예시**:
```json
{
  "date": "2025-11-15",
  "interest": "백엔드 개발",
  "title": "2025년 백엔드 개발 트렌드",
  "summary": "최근 백엔드 개발에서는 서버리스 아키텍처와 컨테이너 기술이 주목받고 있습니다...",
  "content": "상세 리포트 내용..."
}
```

### 3. 사용자 관심사 설정 API
- **엔드포인트**: `PATCH /auth/interests`
- **인증**: JWT 토큰 필요
- **요청 본문**:
```json
{
  "interests": "백엔드 개발,데이터 엔지니어,DevOps"
}
```
- **설명**: 사용자의 관심 직군/직무를 설정합니다. 쉼표로 구분하여 여러 개 입력 가능합니다.

### 4. 사용자 프로필 조회 API
- **엔드포인트**: `GET /auth/profile`
- **인증**: JWT 토큰 필요
- **응답 예시**:
```json
{
  "id": 1,
  "name": "홍길동",
  "interests": "백엔드 개발,데이터 엔지니어",
  "lastLogin": "2025-11-15T12:00:00.000Z",
  "createTime": "2025-11-10T12:00:00.000Z",
  "updateTime": "2025-11-15T12:00:00.000Z"
}
```

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
- `interests`: 관심 직군/직무 (쉼표로 구분된 문자열)

### DailyKeyword 모델
- `date`: 날짜 (YYYY-MM-DD 형식)
- `interest`: 직군/직무
- `keyword`: 오늘의 키워드
- `description`: 키워드 설명

### DailyReport 모델
- `date`: 날짜 (YYYY-MM-DD 형식)
- `interest`: 직군/직무
- `title`: 리포트 제목
- `summary`: 3분 산업 리포트 요약
- `content`: 전체 리포트 내용

## 캐싱 전략

- 동일한 날짜와 직군/직무에 대한 키워드 및 리포트는 데이터베이스에 캐싱됩니다.
- 같은 날짜에 동일한 직군/직무로 재요청 시, Upstage API를 다시 호출하지 않고 캐싱된 데이터를 반환합니다.
- 이를 통해 API 호출 비용을 절감하고 응답 속도를 향상시킵니다.

## 구현 세부사항

### 1. Upstage Service (`src/upstage/upstage.service.ts`)
- OpenAI SDK를 사용하여 Upstage Solar API와 통신
- `generateDailyKeyword()`: 오늘의 키워드 생성
- `generateDailyReport()`: 오늘의 산업 리포트 생성

### 2. Daily Service (`src/daily/daily.service.ts`)
- 사용자의 관심 직군/직무 확인
- 캐시된 데이터 조회 및 새 데이터 생성
- Prisma를 사용한 데이터베이스 연동

### 3. Daily Controller (`src/daily/daily.controller.ts`)
- JWT 인증을 통한 사용자 확인
- RESTful API 엔드포인트 제공

## 사용 예시

### 1. 회원가입 및 로그인
```bash
# 회원가입
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "testuser", "password": "password123", "realName": "홍길동"}'

# 로그인
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "testuser", "password": "password123"}'
```

### 2. 관심 직군/직무 설정
```bash
curl -X PATCH http://localhost:4000/auth/interests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"interests": "백엔드 개발,데이터 엔지니어"}'
```

### 3. 오늘의 키워드 조회
```bash
curl -X GET http://localhost:4000/api/daily/keyword \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. 오늘의 산업 리포트 조회
```bash
curl -X GET http://localhost:4000/api/daily/report \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 주의사항

1. **API 키 보안**: `.env` 파일을 절대 Git에 커밋하지 마세요.
2. **관심사 설정**: 오늘의 키워드 및 리포트를 조회하기 전에 반드시 관심 직군/직무를 설정해야 합니다.
3. **API 호출 제한**: Upstage API의 호출 제한을 확인하고 적절히 사용하세요.

## 향후 개선 사항

1. 여러 관심사에 대한 키워드 및 리포트 동시 제공
2. 키워드 및 리포트 히스토리 조회 기능
3. 특정 날짜의 키워드 및 리포트 조회
4. 사용자 피드백을 통한 추천 개선
