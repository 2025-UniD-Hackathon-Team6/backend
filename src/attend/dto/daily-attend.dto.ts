import type { StressLevel } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class DailyAttendDto {
  @IsNotEmpty()
  stressLevel : StressLevel;
}
