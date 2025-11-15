import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInterestsDto {
  @ApiProperty({
    description: '쉼표로 구분된 관심 직군/직무',
    example: '백엔드 개발,데이터 엔지니어',
  })
  @IsString()
  @IsNotEmpty()
  readonly interests: string; // 쉼표로 구분된 관심 직군/직무 (예: "백엔드 개발,데이터 엔지니어")
}
