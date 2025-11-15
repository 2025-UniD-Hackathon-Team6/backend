import { PrismaService } from '@libs/prisma';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class JobService {
    constructor(private readonly prisma: PrismaService) {}

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
     * 사용자의 관심 직군/직무에 따른 채용공고를 DB에서 조회합니다.
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

        return {
            totalCount: jobs.length,
            jobs: jobs,
        };
    }
}