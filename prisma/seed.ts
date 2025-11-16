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
    description: "프론트엔드, 백엔드, 모바일",
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
  {
    name: "데이터 분석",
    description: "데이터 분석, AI/ML",
    positions: [
    ]
  },
  {
    name: "디자인",
    description: "UI/UX, 그래픽 디자인",
    positions: [
    ]
  },
  {
    name: "마케팅",
    description: "디지털 마케팅, 콘텐츠",
    positions: [
    ]
  },
  {
    name: "금융",
    description: "투자, 재무 분석",
    positions: [
    ]
  },
  {
    name: "컨설팅",
    description: "경영, 전략 컨설팅",
    positions: [
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

async function main() {
  await job();
  await user();
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
