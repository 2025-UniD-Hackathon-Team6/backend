import type { StressLevel } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class DailyAttendDto {
  @IsNotEmpty()
  stressLevel : StressLevel;

  @IsString()
  mood?: string;

  @IsString()
  note?: string;
}
