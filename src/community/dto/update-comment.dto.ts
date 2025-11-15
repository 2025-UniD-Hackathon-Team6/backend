import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateCommentDto {
    @ApiProperty({ description: '댓글 내용', example: '수정된 댓글 내용입니다' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    content: string;
}
