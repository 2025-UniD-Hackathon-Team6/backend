import { Controller, Delete, Get, Post } from '@nestjs/common';
import type { JobService } from './job.service';
import { AuthNotNeeded } from '@libs/jwt';

@Controller('job')
export class JobController {
    constructor(private readonly jobService: JobService) {}

    @AuthNotNeeded()
    @Get('categories')
    async getCategories() {
        return await this.jobService.getCategories();
    }

    @AuthNotNeeded()
    @Get('positions')
    async getPositions() {
        return await this.jobService.getPositions();
    }

    @Post('categories/interest')
    async addInterestedCategories() {
        return await this.jobService.addInterestedCategories();
    }

    @Post('positions/interest')
    async addInterestedPositions() {
        return await this.jobService.addInterestedPositions();
    }

    @Delete('categories/interest')
    async deleteInterestedCategories() {
        return await this.jobService.deleteInterestedCategories();
    }

    @Delete('positions/interest')
    async deleteInterestedPositions() {
        return await this.jobService.deleteInterestedPositions();
    }
}
