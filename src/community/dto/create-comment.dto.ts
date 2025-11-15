import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({ description: '댓글 내용', example: '좋은 정보 감사합니다!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    content: string;
}
