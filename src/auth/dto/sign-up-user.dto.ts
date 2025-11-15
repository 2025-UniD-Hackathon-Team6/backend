import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';
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
}
