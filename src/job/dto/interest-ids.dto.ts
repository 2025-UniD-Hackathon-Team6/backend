import { IsArray } from 'class-validator';

export class InterestIds {
  @IsArray()
  Ids: number[];
}