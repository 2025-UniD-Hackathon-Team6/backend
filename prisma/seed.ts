import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

type Pos = {
    name: string,
    description: string
}

const jobs: {
  name: string;
  description: string
  positions: Pos[];
}[] = [
  {
    name: "개발",
    description: "개발 직군",
    positions: [
        {
            name: "PM",
            description: "프로젝트 매니저"
        },
        {
            name: "백엔드 개발자",
            description: "서비스의 백엔드를 개발합니다"
        },
        {
            name: "프론트엔드 개발자",
            description: "서비스의 프론트엔드를 개발합니다"
        },
    ]
  },

];

async function job() {
  const createJobs = jobs.map(async (job) => {
    const collegeId = await prisma.jobCategory.create({
      data: {
        name: job.name,
        description: job.description
      },
      select: {
        id: true,
      },
    });

    await prisma.jobPosition.createMany({
      data: job.positions.map((pos) => {
        return {
            categoryId: collegeId.id,
            name: pos.name,
            description: pos.description
        };
      }),
    });
  });

  await Promise.all(createJobs);
}

async function user() {
    const encryptedPassword = await hash('password', {
        timeCost: 2,
        memoryCost: 2 ** 11,
        parallelism: 1,
    });
    await prisma.user.create({
    data: {
        name: 'user',
        password: encryptedPassword,
    },
    });
}

async function jobPostings() {
  console.log('채용공고 더미 데이터 생성 중...');

  // 카테고리와 포지션 가져오기
  const categories = await prisma.jobCategory.findMany({
    include: {
      positions: true
    }
  });

  if (categories.length === 0) {
    console.log('먼저 카테고리와 포지션을 생성해주세요.');
    return;
  }

  const jobPostingsData = [
    // 백엔드 개발자 공고
    {
      categoryName: "개발",
      positionName: "백엔드 개발자",
      companyName: "네이버",
      title: "Spring Boot 백엔드 개발자 채용",
      description: "대규모 트래픽을 처리하는 백엔드 시스템을 개발할 Spring Boot 개발자를 모집합니다. MSA 아키텍처 경험자 우대합니다.",
      location: "경기 성남시 분당구",
      employmentType: "정규직",
      deadline: new Date('2025-12-31'),
      sourceUrl: "https://recruit.navercorp.com"
    },
    {
      categoryName: "개발",
      positionName: "백엔드 개발자",
      companyName: "카카오",
      title: "Node.js 백엔드 개발자 (신입/경력)",
      description: "카카오톡 플랫폼의 백엔드 API 서버를 개발하고 운영합니다. Node.js, TypeScript 경험이 있으신 분을 찾습니다.",
      location: "경기 성남시 분당구",
      employmentType: "정규직",
      deadline: new Date('2025-11-30'),
      sourceUrl: "https://careers.kakao.com"
    },
    {
      categoryName: "개발",
      positionName: "백엔드 개발자",
      companyName: "쿠팡",
      title: "Java 백엔드 개발자 대규모 채용",
      description: "e-커머스 플랫폼의 핵심 백엔드 시스템을 개발합니다. Java, Spring Framework 사용 경험 필수입니다.",
      location: "서울 송파구",
      employmentType: "정규직",
      deadline: new Date('2026-01-15'),
      sourceUrl: "https://www.coupang.jobs"
    },
    {
      categoryName: "개발",
      positionName: "백엔드 개발자",
      companyName: "토스",
      title: "Kotlin 백엔드 개발자 (결제 플랫폼)",
      description: "안정적인 금융 서비스를 위한 백엔드 시스템을 개발합니다. Kotlin, Spring Boot 경험자 우대합니다.",
      location: "서울 강남구",
      employmentType: "정규직",
      deadline: new Date('2025-12-20'),
      sourceUrl: "https://toss.im/career"
    },
    {
      categoryName: "개발",
      positionName: "백엔드 개발자",
      title: "Python/Django 백엔드 개발자",
      companyName: "당근마켓",
      description: "지역 기반 커뮤니티 서비스의 백엔드를 개발합니다. Python, Django 프레임워크 경험이 있으신 분을 찾습니다.",
      location: "서울 구로구",
      employmentType: "정규직",
      deadline: new Date('2025-12-25'),
      sourceUrl: "https://www.daangn.com/jobs"
    },

    // 프론트엔드 개발자 공고
    {
      categoryName: "개발",
      positionName: "프론트엔드 개발자",
      companyName: "네이버",
      title: "React 프론트엔드 개발자 채용",
      description: "네이버 메인 서비스의 프론트엔드를 개발합니다. React, TypeScript 경험 필수입니다.",
      location: "경기 성남시 분당구",
      employmentType: "정규직",
      deadline: new Date('2025-12-31'),
      sourceUrl: "https://recruit.navercorp.com"
    },
    {
      categoryName: "개발",
      positionName: "프론트엔드 개발자",
      companyName: "라인",
      title: "Vue.js 프론트엔드 개발자",
      description: "LINE 메신저 웹 버전 개발에 참여합니다. Vue.js 3.x 경험자 우대합니다.",
      location: "경기 성남시 분당구",
      employmentType: "정규직",
      deadline: new Date('2026-01-10'),
      sourceUrl: "https://careers.linecorp.com"
    },
    {
      categoryName: "개발",
      positionName: "프론트엔드 개발자",
      companyName: "배달의민족",
      title: "프론트엔드 개발자 (React Native)",
      description: "배달의민족 앱 개발에 참여합니다. React Native 경험이 있으신 분을 찾습니다.",
      location: "서울 송파구",
      employmentType: "정규직",
      deadline: new Date('2025-12-15'),
      sourceUrl: "https://www.woowahan.com"
    },
    {
      categoryName: "개발",
      positionName: "프론트엔드 개발자",
      companyName: "넥슨",
      title: "게임 웹 프론트엔드 개발자",
      description: "게임 포털 및 커뮤니티 서비스의 프론트엔드를 개발합니다. Next.js 경험자 우대합니다.",
      location: "경기 성남시 분당구",
      employmentType: "정규직",
      deadline: new Date('2025-12-28'),
      sourceUrl: "https://careers.nexon.com"
    },
    {
      categoryName: "개발",
      positionName: "프론트엔드 개발자",
      companyName: "야놀자",
      title: "프론트엔드 개발자 (숙박 예약 서비스)",
      description: "숙박 예약 플랫폼의 웹 프론트엔드를 개발합니다. React, Redux 경험 필수입니다.",
      location: "서울 강남구",
      employmentType: "정규직",
      deadline: new Date('2026-01-05'),
      sourceUrl: "https://www.yanolja.com/career"
    },

    // PM 공고
    {
      categoryName: "개발",
      positionName: "PM",
      companyName: "카카오",
      title: "프로덕트 매니저 (메신저 플랫폼)",
      description: "카카오톡 플랫폼의 신규 기능을 기획하고 개발을 리드합니다. 3년 이상 PM 경험자 우대합니다.",
      location: "경기 성남시 분당구",
      employmentType: "정규직",
      deadline: new Date('2025-12-31'),
      sourceUrl: "https://careers.kakao.com"
    },
    {
      categoryName: "개발",
      positionName: "PM",
      companyName: "쿠팡",
      title: "테크 PM (로켓배송)",
      description: "로켓배송 서비스의 기술 전략을 수립하고 실행합니다. 물류 도메인 이해도가 있으신 분을 찾습니다.",
      location: "서울 송파구",
      employmentType: "정규직",
      deadline: new Date('2025-12-20'),
      sourceUrl: "https://www.coupang.jobs"
    },
    {
      categoryName: "개발",
      positionName: "PM",
      companyName: "토스",
      title: "프로덕트 오너 (금융 플랫폼)",
      description: "토스뱅크의 신규 금융 상품을 기획하고 개발합니다. 금융권 경험자 우대합니다.",
      location: "서울 강남구",
      employmentType: "정규직",
      deadline: new Date('2026-01-10'),
      sourceUrl: "https://toss.im/career"
    },
    {
      categoryName: "개발",
      positionName: "PM",
      companyName: "당근마켓",
      title: "프로덕트 매니저 (커뮤니티)",
      description: "지역 커뮤니티 기능을 기획하고 개선합니다. 데이터 기반 의사결정 경험이 있으신 분을 찾습니다.",
      location: "서울 구로구",
      employmentType: "정규직",
      deadline: new Date('2025-12-25'),
      sourceUrl: "https://www.daangn.com/jobs"
    },
    {
      categoryName: "개발",
      positionName: "PM",
      companyName: "무신사",
      title: "테크 PM (이커머스)",
      description: "패션 이커머스 플랫폼의 검색/추천 기능을 개선합니다. ML/AI 프로젝트 경험자 우대합니다.",
      location: "서울 성동구",
      employmentType: "정규직",
      deadline: new Date('2026-01-15'),
      sourceUrl: "https://www.musinsa.com/careers"
    },
  ];

  // 채용공고 생성
  for (const posting of jobPostingsData) {
    try {
      const category = categories.find(c => c.name === posting.categoryName);
      if (!category) {
        console.log(`카테고리를 찾을 수 없습니다: ${posting.categoryName}`);
        continue;
      }

      const position = category.positions.find(p => p.name === posting.positionName);
      if (!position) {
        console.log(`포지션을 찾을 수 없습니다: ${posting.positionName}`);
        continue;
      }

      await prisma.jobPosting.create({
        data: {
          categoryId: category.id,
          positionId: position.id,
          companyName: posting.companyName,
          title: posting.title,
          description: posting.description,
          location: posting.location,
          employmentType: posting.employmentType,
          deadline: posting.deadline,
          sourceUrl: posting.sourceUrl,
        }
      });

      console.log(`✅ ${posting.companyName} - ${posting.title}`);
    } catch (error) {
      console.error(`❌ 채용공고 생성 실패:`, error);
    }
  }

  console.log('채용공고 더미 데이터 생성 완료!');
}

async function main() {
  await job();
  await user();
  await jobPostings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
