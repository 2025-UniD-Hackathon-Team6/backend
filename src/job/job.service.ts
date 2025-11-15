import { PrismaService } from '@libs/prisma';
import { Injectable, UnprocessableEntityException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class JobService {
    private readonly logger = new Logger(JobService.name);
    private readonly dataGoKrApiKey: string;
    private readonly dataGoKrApiUrl = 'https://apis.data.go.kr/1051000/recruitment/list';

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.dataGoKrApiKey = this.configService.get<string>('DATA_GO_KR_API_KEY') || '';
    }

    async getCategories() {
        return await this.prisma.jobCategory.findMany();
    }

    async getPositions() {
        return await this.prisma.jobPosition.findMany();
    }

    async addInterestedCategories(userId: number, categoryIds: number[]) {
        const categoryList = await this.prisma.jobCategory.findMany({
            where: {
                id: {
                    in: categoryIds
                }
            },
            select: {
                id: true
            }
        })

        if(categoryList.length < categoryIds.length){
            throw new UnprocessableEntityException('id is not exist')
        }

        const previous = await this.prisma.userInterestedCategory.findMany({
            where: {
                userId
            },
            select: {
                id: true
            }
        })
        const previousIds = previous.map((p) => p.id)

        return await this.prisma.userInterestedCategory.createManyAndReturn({
            data: categoryIds
                .filter((id) => !previousIds.includes(id))
                .map((id) => {
                    return {
                        userId,
                        categoryId: id
                    }
                })
        })
    }

    async addInterestedPositions(userId: number, positionIds: number[]) {
        const positionList = await this.prisma.jobPosition.findMany({
            where: {
                id: {
                    in: positionIds
                }
            },
            select: {
                id: true
            }
        })

        if(positionList.length < positionIds.length){
            throw new UnprocessableEntityException('id is not exist')
        }

        const previous = await this.prisma.userInterestedPosition.findMany({
            where: {
                userId
            },
            select: {
                id: true
            }
        })
        const previousIds = previous.map((p) => p.id)

        return await this.prisma.userInterestedPosition.createManyAndReturn({
            data: positionIds
                .filter((id) => !previousIds.includes(id))
                .map((id) => {
                    return {
                        userId,
                        positionId: id
                    }
                })
        })
    }

    async deleteInterestedCategories(userId: number, categoryIds: number[]) {
        return await this.prisma.userInterestedCategory.deleteMany({
            where: {
                userId,
                categoryId: {
                    in: categoryIds
                }
            }
        })
    }

    async deleteInterestedPositions(userId: number, positionIds: number[]) {
        return await this.prisma.userInterestedPosition.deleteMany({
            where: {
                userId,
                positionId: {
                    in: positionIds
                }
            }
        })
    }

    /**
     * 공공데이터 포털 API를 통해 채용공고를 조회합니다.
     * @param params - 검색 파라미터
     * @returns 채용공고 목록
     */
    async fetchJobsFromDataGoKr(params: {
        numOfRows?: number;
        pageNo?: number;
        searchKeyword?: string;
    }) {
        try {
            const { numOfRows = 10, pageNo = 1, searchKeyword = '' } = params;

            // 다양한 검색 파라미터 시도
            const queryParams: any = {
                serviceKey: this.dataGoKrApiKey,
                numOfRows,
                pageNo,
                resultType: 'json',
            };

            // 검색어가 있을 경우 다양한 파라미터명으로 시도
            if (searchKeyword) {
                queryParams.keyword = searchKeyword;  // 일반적인 파라미터명
                queryParams.searchKeyword = searchKeyword;
                queryParams.search = searchKeyword;
            }

            this.logger.log('=== Data.go.kr API 호출 시작 ===');
            this.logger.log('검색 키워드:', searchKeyword || '없음');
            this.logger.log('요청 URL:', this.dataGoKrApiUrl);
            this.logger.log('요청 파라미터:', JSON.stringify(queryParams, null, 2));

            const response = await axios.get(this.dataGoKrApiUrl, {
                params: queryParams,
                timeout: 10000,
            });

            this.logger.log('응답 상태:', response.status);
            this.logger.log('응답 데이터 일부:', JSON.stringify(response.data).substring(0, 500));
            this.logger.log('=== API 호출 완료 ===');

            return response.data;
        } catch (error) {
            this.logger.error('Data.go.kr API 호출 실패:', error);
            if (axios.isAxiosError(error)) {
                this.logger.error('에러 상태:', error.response?.status);
                this.logger.error('에러 데이터:', error.response?.data);
            }
            throw new Error('채용공고 조회 중 오류가 발생했습니다.');
        }
    }

    /**
     * Data.go.kr API에서 채용공고를 가져와 DB에 저장합니다.
     * @param numOfRows - 가져올 공고 수 (기본값: 100)
     * @returns 저장된 공고 수
     */
    async syncJobPostingsFromDataGoKr(numOfRows: number = 100) {
        try {
            this.logger.log(`=== 채용공고 동기화 시작 (${numOfRows}개) ===`);

            const response = await axios.get(this.dataGoKrApiUrl, {
                params: {
                    serviceKey: this.dataGoKrApiKey,
                    numOfRows,
                    pageNo: 1,
                    resultType: 'json',
                },
                timeout: 10000,
            });

            const apiData = response.data;

            if (!apiData.result || !Array.isArray(apiData.result)) {
                this.logger.error('API 응답 형식 오류:', apiData);
                throw new Error('잘못된 API 응답 형식입니다.');
            }

            this.logger.log(`API에서 ${apiData.result.length}개 공고 수신`);

            // 기본 카테고리와 포지션 가져오기
            const defaultCategory = await this.prisma.jobCategory.findFirst();
            const defaultPosition = await this.prisma.jobPosition.findFirst();

            if (!defaultCategory || !defaultPosition) {
                throw new Error('기본 카테고리 또는 포지션이 없습니다. 먼저 생성해주세요.');
            }

            let savedCount = 0;

            for (const job of apiData.result) {
                try {
                    // 마감일 파싱 (YYYYMMDD -> DateTime)
                    let deadline = null;
                    if (job.pbancEndYmd) {
                        const year = job.pbancEndYmd.substring(0, 4);
                        const month = job.pbancEndYmd.substring(4, 6);
                        const day = job.pbancEndYmd.substring(6, 8);
                        deadline = new Date(`${year}-${month}-${day}`);
                    }

                    // 중복 체크 (같은 제목과 회사명이 있으면 업데이트)
                    const existing = await this.prisma.jobPosting.findFirst({
                        where: {
                            title: job.recrutPbancTtl,
                            companyName: job.instNm,
                        },
                    });

                    const postingData = {
                        categoryId: defaultCategory.id,
                        positionId: defaultPosition.id,
                        companyName: job.instNm || '정보없음',
                        title: job.recrutPbancTtl || '제목없음',
                        description: job.recrutPbancTtl || '설명없음',
                        location: job.workRgnNmLst || null,
                        employmentType: job.hireTypeNmLst || null,
                        deadline: deadline,
                        sourceUrl: job.srcUrl || null,
                    };

                    if (existing) {
                        await this.prisma.jobPosting.update({
                            where: { id: existing.id },
                            data: postingData,
                        });
                    } else {
                        await this.prisma.jobPosting.create({
                            data: postingData,
                        });
                        savedCount++;
                    }
                } catch (error) {
                    this.logger.error(`공고 저장 실패:`, error);
                }
            }

            this.logger.log(`=== 동기화 완료: ${savedCount}개 신규 저장 ===`);
            return {
                total: apiData.result.length,
                saved: savedCount,
                message: `${savedCount}개의 신규 공고가 저장되었습니다.`
            };
        } catch (error) {
            this.logger.error('채용공고 동기화 실패:', error);
            throw new Error('채용공고 동기화 중 오류가 발생했습니다.');
        }
    }

    /**
     * 사용자의 관심 직군/직무에 따른 채용공고를 추천합니다.
     * @param userId - 사용자 ID (선택)
     * @param numOfRows - 결과 수
     * @returns 추천 채용공고 목록
     */
    async getRecommendedJobs(userId?: number, numOfRows: number = 10) {
        let searchKeyword = '';
        let categoryIds: number[] = [];
        let positionIds: number[] = [];

        // 사용자 ID가 제공된 경우, 관심 직군/직무를 조회
        if (userId) {
            const userInterests = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    interestedCategories: {
                        include: {
                            category: true,
                        },
                    },
                    interestedPositions: {
                        include: {
                            position: true,
                        },
                    },
                },
            });

            if (userInterests) {
                categoryIds = userInterests.interestedCategories.map((ic) => ic.categoryId);
                positionIds = userInterests.interestedPositions.map((ip) => ip.positionId);

                const categoryNames = userInterests.interestedCategories.map((ic) => ic.category.name);
                const positionNames = userInterests.interestedPositions.map((ip) => ip.position.name);

                if (positionNames.length > 0) {
                    searchKeyword = positionNames.join(', ');
                    this.logger.log(`사용자 ${userId}의 관심 직무: ${searchKeyword}`);
                } else if (categoryNames.length > 0) {
                    searchKeyword = categoryNames.join(', ');
                    this.logger.log(`사용자 ${userId}의 관심 직군: ${searchKeyword}`);
                }
            }
        }

        // DB에서 채용공고 조회
        const whereClause: any = {};

        if (positionIds.length > 0) {
            whereClause.positionId = { in: positionIds };
        } else if (categoryIds.length > 0) {
            whereClause.categoryId = { in: categoryIds };
        }

        const jobs = await this.prisma.jobPosting.findMany({
            where: whereClause,
            take: numOfRows,
            include: {
                category: true,
                position: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        this.logger.log(`DB에서 ${jobs.length}개 공고 조회 완료`);

        return {
            searchKeyword,
            totalCount: jobs.length,
            jobs: jobs,
        };
    }

}
