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

}
