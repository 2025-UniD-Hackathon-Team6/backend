import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InterestIds {
  @ApiProperty({
    description: '관심 항목의 ID 배열',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  Ids: number[];
}