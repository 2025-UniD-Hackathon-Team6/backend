import { IsAlphanumeric, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: '사용자 이름 (영문, 숫자만 가능)',
    example: 'johndoe',
  })
  @IsAlphanumeric()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    description: '실제 이름 (한글, 영문, 공백만 가능)',
    example: '홍길동',
  })
  @Matches(/^[가-힣a-zA-Z \s]+$/)
  @IsNotEmpty()
  readonly realName: string;
}
