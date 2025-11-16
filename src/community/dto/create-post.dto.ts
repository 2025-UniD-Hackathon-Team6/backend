import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
    @ApiProperty({ description: '게시글 제목', example: '취업 준비 팁 공유합니다' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(200)
    title: string;

    @ApiProperty({ description: '게시글 내용', example: '오늘 면접에서 좋은 경험을 했습니다...' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    content: string;
}
