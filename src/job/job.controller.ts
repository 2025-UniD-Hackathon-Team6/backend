import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { AuthNotNeeded, type AuthenticatedRequest } from '@libs/jwt';
import { InterestIds } from './dto/interest-ids.dto';

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
    async addInterestedCategories(
        @Req() req: AuthenticatedRequest,
        @Body() categoryIds: InterestIds,
    ) {
        return await this.jobService.addInterestedCategories(
            req.user.id,
            categoryIds.Ids
        );
    }

    @Post('positions/interest')
    async addInterestedPositions(
        @Req() req: AuthenticatedRequest,
        @Body() positionIds: InterestIds,
    ) {
        return await this.jobService.addInterestedPositions(
            req.user.id,
            positionIds.Ids
        );
    }

    @Delete('categories/interest')
    async deleteInterestedCategories(
        @Req() req: AuthenticatedRequest,
        @Body() categoryIds: InterestIds,
    ) {
        return await this.jobService.deleteInterestedCategories(
            req.user.id,
            categoryIds.Ids
        );
    }

    @Delete('positions/interest')
    async deleteInterestedPositions(
        @Req() req: AuthenticatedRequest,
        @Body() positionIds: InterestIds,
    ) {
        return await this.jobService.deleteInterestedPositions(
            req.user.id,
            positionIds.Ids
        );
    }
}
