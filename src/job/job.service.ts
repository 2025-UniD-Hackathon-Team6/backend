import type { PrismaService } from '@libs/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobService {
    constructor(private readonly prisma: PrismaService) {}

    async getCategories() {
        
    }

    async getPositions() {

    }

    async addInterestedCategories() {

    }

    async addInterestedPositions() {

    }

    async deleteInterestedCategories() {

    }

    async deleteInterestedPositions() {

    }

}
