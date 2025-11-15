import { PrismaService } from '@libs/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AttendService {
    constructor(private readonly prisma: PrismaService) {}

    async checkTodayAttendance(userId: number){
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘 0시 0분 0초

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return await this.prisma.dailyAttendance.findFirst({
            where: {
                userId,
                checkinDate: {
                    gte: today,
                    lt: tomorrow
                }
            },
            orderBy: {
                checkinDate: 'asc'
            }
        })
    }

    async checkMothlyAttendance(userId: number){
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return await this.prisma.dailyAttendance.findMany({
            where: {
                userId,
                checkinDate: {
                    gte: startOfMonth,
                    lt: startOfNextMonth
                }
            },
            orderBy: {
                checkinDate: 'asc'
            }
        })
    }
}
