#!/bin/bash

# AI 프롬프트 개인화 테스트 스크립트
# 사용법: ./test-personalization.sh YOUR_JWT_TOKEN

TOKEN=$1
BASE_URL="http://localhost:3000"

if [ -z "$TOKEN" ]; then
  echo "Usage: ./test-personalization.sh YOUR_JWT_TOKEN"
  exit 1
fi

echo "=== AI 프롬프트 개인화 테스트 ==="
echo ""

echo "📚 1. 오늘의 키워드 조회..."
KEYWORD_RESPONSE=$(curl -s -X GET "$BASE_URL/api/daily/keyword" \
  -H "Authorization: Bearer $TOKEN")
echo "$KEYWORD_RESPONSE" | jq '.'
echo ""

echo "📊 2. 오늘의 리포트 조회..."
REPORT_RESPONSE=$(curl -s -X GET "$BASE_URL/api/daily/report" \
  -H "Authorization: Bearer $TOKEN")
echo "$REPORT_RESPONSE" | jq '.'
echo ""

echo "✅ 테스트 완료!"
echo ""
echo "💡 확인 사항:"
echo "  - Prisma Studio (http://localhost:5555)에서 DailyKeyword/DailyReport 테이블 확인"
echo "  - 같은 userId의 여러 날짜 데이터를 비교해서 중복 없는지 확인"
echo "  - 내일 다시 API 호출해서 새로운 키워드/리포트가 생성되는지 확인"
