import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AttendService } from './attend.service';
import type { AuthenticatedRequest } from '@libs/jwt';
import type { DailyAttendDto } from './dto/daily-attend.dto';

@Controller('attend')
export class AttendController {
    constructor(private readonly attendService: AttendService) {}

    @Get()
    async attend(
        @Req() req: AuthenticatedRequest,
        @Body() dailyAttendDto : DailyAttendDto
    ) {
        return await this.attendService.attend(req.user.id, dailyAttendDto);
    }

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
