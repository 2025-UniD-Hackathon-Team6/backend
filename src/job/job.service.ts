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
                categoryId: true  // ✅ id 대신 categoryId
            }
        })
        const previousIds = previous.map((p) => p.categoryId)  // ✅ 수정

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
                positionId: true  // ✅ id 대신 positionId
            }
        })
        const previousIds = previous.map((p) => p.positionId)  // ✅ 수정

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
     * 사용자의 관심 직군/직무에 따른 채용공고를 추천합니다.
     * @param userId - 사용자 ID (선택)
     * @param numOfRows - 결과 수
     * @returns 추천 채용공고 목록
     */
    async getRecommendedJobs(userId?: number, numOfRows: number = 10) {
        let searchKeyword = '개발';

        // 사용자 ID가 제공된 경우, 관심 직군/직무를 조회
        if (userId) {
            const userInterests = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    UserInterestedCategory: {  // ✅ 수정
                        include: {
                            category: true,
                        },
                    },
                    UserInterestedPosition: {  // ✅ 수정
                        include: {
                            position: true,
                        },
                    },
                },
            });

            if (userInterests) {
                // 관심 카테고리와 포지션 이름을 조합하여 검색 키워드 생성
                const categories = userInterests.UserInterestedCategory.map(  // ✅ 수정
                    (ic) => ic.category.name,
                );
                const positions = userInterests.UserInterestedPosition.map(  // ✅ 수정
                    (ip) => ip.position.name,
                );

                // 우선순위: 포지션(직무) > 카테고리(직군)
                if (positions.length > 0) {
                    searchKeyword = positions[0];
                    this.logger.log(`사용자 ${userId}의 관심 직무에서 추출한 검색 키워드: ${searchKeyword}`);
                } else if (categories.length > 0) {
                    searchKeyword = categories[0];
                    this.logger.log(`사용자 ${userId}의 관심 직군에서 추출한 검색 키워드: ${searchKeyword}`);
                } else {
                    this.logger.log(`사용자 ${userId}는 관심 직무/직군이 없습니다.`);
                }
            }
        }

        // 공공데이터 API 호출
        const jobsData = await this.fetchJobsFromDataGoKr({
            numOfRows,
            pageNo: 1,
            searchKeyword,
        });

        return {
            searchKeyword,
            jobs: jobsData,
        };
    }
}