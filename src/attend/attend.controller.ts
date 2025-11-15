import { Body, Controller, Post, Req } from '@nestjs/common';
import { AttendService } from './attend.service';
import type { AuthenticatedRequest } from '@libs/jwt';

@Controller('attend')
export class AttendController {
    constructor(private readonly attendService: AttendService) {}

    @Post('today')
    async checkTodayAttendance(
        @Req() req: AuthenticatedRequest
    ) {
        return await this.attendService.checkTodayAttendance(req.user.id);
    }

    @Post('month')
    async checkMothlyAttendance(
        @Req() req: AuthenticatedRequest
    ) {
        return await this.attendService.checkMothlyAttendance(req.user.id);
    }
}
